-- =============================================================================
-- ДАНЕК · 0007 · Финансы, объявления, очередь уведомлений
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Индивидуальные скидки к тарифу
-- -----------------------------------------------------------------------------

create table public.student_tuition (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students (id) on delete cascade,
  tuition_plan_id  uuid not null references public.tuition_plans (id) on delete cascade,
  -- Скидка в процентах: 0 — стандартный тариф, 100 — обучение бесплатное (грант).
  discount_percent smallint not null default 0,
  reason           text,
  created_at       timestamptz not null default now(),

  constraint student_tuition_discount check (discount_percent between 0 and 100)
);

comment on table public.student_tuition is
  'Скидка ученика к тарифу — многодетная семья, грант, работник школы. Без строки
   здесь начисление идёт по полной цене tuition_plans.';

create unique index student_tuition_one_active_idx on public.student_tuition (student_id);

alter table public.student_tuition enable row level security;

create policy "student_tuition_select_office"
  on public.student_tuition for select to authenticated using (public.is_office());

create policy "student_tuition_select_own"
  on public.student_tuition for select to authenticated
  using (public.guardian_of(student_id));

create policy "student_tuition_all_office"
  on public.student_tuition for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Начисления
-- -----------------------------------------------------------------------------

create type public.invoice_status as enum ('open', 'partially_paid', 'paid', 'cancelled');

create table public.invoices (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students (id) on delete cascade,
  -- Человекочитаемый номер для квитанции: «2026-000042».
  number        text not null unique,
  period_start  date not null,
  period_end    date not null,
  amount_kgs    numeric(12, 2) not null,
  status        public.invoice_status not null default 'open',
  due_on        date not null,
  note          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint invoices_amount check (amount_kgs >= 0),
  constraint invoices_period check (period_end > period_start)
);

comment on table public.invoices is
  'Начисление за период — обычно месяц. amount_kgs уже учитывает скидку ученика,
   пересчитывать на клиенте не нужно.';

create index invoices_student_idx on public.invoices (student_id, period_start desc);
create index invoices_status_idx on public.invoices (status) where status in ('open', 'partially_paid');

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;

create policy "invoices_select_office"
  on public.invoices for select to authenticated using (public.is_office());

create policy "invoices_select_own"
  on public.invoices for select to authenticated
  using (public.guardian_of(student_id));

create policy "invoices_all_office"
  on public.invoices for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- Номер начисления генерируется сам: год + порядковый номер с ведущими нулями.
create or replace function public.generate_invoice_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year   text := to_char(new.period_start, 'YYYY');
  v_serial int;
begin
  if new.number is not null and new.number <> '' then
    return new;
  end if;

  select count(*) + 1 into v_serial
  from public.invoices
  where number like v_year || '-%';

  new.number := v_year || '-' || lpad(v_serial::text, 6, '0');
  return new;
end;
$$;

create trigger invoices_generate_number
  before insert on public.invoices
  for each row execute function public.generate_invoice_number();

-- -----------------------------------------------------------------------------
-- Платежи
-- -----------------------------------------------------------------------------

create type public.payment_method as enum ('bank_transfer', 'qr', 'cash', 'card');
create type public.payment_status as enum ('pending', 'confirmed', 'rejected');

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  invoice_id    uuid not null references public.invoices (id) on delete cascade,
  amount_kgs    numeric(12, 2) not null,
  method        public.payment_method not null default 'bank_transfer',
  status        public.payment_status not null default 'pending',
  receipt_path  text,
  paid_at       timestamptz not null default now(),
  confirmed_by  uuid references public.profiles (id) on delete set null,
  confirmed_at  timestamptz,
  submitted_by  uuid references public.profiles (id) on delete set null,
  note          text,
  created_at    timestamptz not null default now(),

  constraint payments_amount check (amount_kgs > 0)
);

comment on table public.payments is
  'Родитель грузит чек → status=pending. Бухгалтер подтверждает → confirmed,
   invoices.status пересчитывается триггером ниже. Отклонённый платёж не
   уменьшает долг — это явный отказ, а не молчаливая потеря денег.';

create index payments_invoice_idx on public.payments (invoice_id);
create index payments_pending_idx on public.payments (status) where status = 'pending';

alter table public.payments enable row level security;

create policy "payments_select_office"
  on public.payments for select to authenticated using (public.is_office());

create policy "payments_select_own"
  on public.payments for select to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = payments.invoice_id and public.guardian_of(i.student_id)
    )
  );

-- Родитель загружает чек сам — но только pending и только за счёт своего ребёнка.
create policy "payments_insert_parent"
  on public.payments for insert to authenticated
  with check (
    status = 'pending'
    and confirmed_by is null
    and confirmed_at is null
    and exists (
      select 1 from public.invoices i
      where i.id = payments.invoice_id and public.guardian_of(i.student_id)
    )
  );

create policy "payments_all_office"
  on public.payments for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- Подтверждение платежа пересчитывает статус начисления: open → partially_paid → paid.
create or replace function public.recalc_invoice_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invoice_id uuid := coalesce(new.invoice_id, old.invoice_id);
  v_total_due  numeric(12, 2);
  v_total_paid numeric(12, 2);
begin
  select amount_kgs into v_total_due from public.invoices where id = v_invoice_id;

  select coalesce(sum(amount_kgs), 0) into v_total_paid
  from public.payments
  where invoice_id = v_invoice_id and status = 'confirmed';

  update public.invoices
    set status = case
      when v_total_paid <= 0 then 'open'
      when v_total_paid < v_total_due then 'partially_paid'
      else 'paid'
    end::public.invoice_status
    where id = v_invoice_id and status <> 'cancelled';

  return null;
end;
$$;

create trigger payments_recalc_invoice
  after insert or update or delete on public.payments
  for each row execute function public.recalc_invoice_status();

-- Подтверждение платежа офисом — отдельная функция вместо прямого UPDATE:
-- проставляет confirmed_by/confirmed_at сама, родитель не может подделать «кто подтвердил».
create or replace function public.confirm_payment(p_payment_id uuid, p_approve boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_office() then
    raise exception 'Подтверждение оплаты доступно только офису' using errcode = '42501';
  end if;

  update public.payments
    set status = (case when p_approve then 'confirmed' else 'rejected' end)::public.payment_status,
        confirmed_by = (select auth.uid()),
        confirmed_at = now()
    where id = p_payment_id and status = 'pending';
end;
$$;

grant execute on function public.confirm_payment(uuid, boolean) to authenticated;

-- -----------------------------------------------------------------------------
-- Объявления
-- -----------------------------------------------------------------------------

create type public.announcement_audience as enum ('all', 'staff', 'parents', 'teachers', 'class');

create table public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  audience    public.announcement_audience not null default 'all',
  -- Заполнено только когда audience = 'class'.
  class_id    uuid references public.classes (id) on delete cascade,
  author_id   uuid references public.profiles (id) on delete set null,
  published_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),

  constraint announcements_title_len check (char_length(title) between 2 and 200),
  constraint announcements_class_audience check (
    (audience = 'class' and class_id is not null) or (audience <> 'class' and class_id is null)
  )
);

comment on table public.announcements is
  'Объявления школы. audience=class виден только семьям и учителю конкретного класса.';

create index announcements_feed_idx on public.announcements (published_at desc);

alter table public.announcements enable row level security;

create policy "announcements_select_staff"
  on public.announcements for select to authenticated using (public.is_staff());

create policy "announcements_select_relevant"
  on public.announcements for select to authenticated
  using (
    audience = 'all'
    or (audience = 'parents' and public.auth_role() = 'parent')
    or (
      audience = 'class'
      and exists (
        select 1 from public.students s
        where s.class_id = announcements.class_id
          and (public.is_own_student(s.id) or public.guardian_of(s.id))
      )
    )
  );

create policy "announcements_all_office"
  on public.announcements for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Очередь уведомлений
-- -----------------------------------------------------------------------------

create type public.notification_channel as enum ('whatsapp', 'email', 'in_app');
create type public.notification_status as enum ('queued', 'sent', 'failed');

create table public.notification_templates (
  key         text primary key,
  channel     public.notification_channel not null,
  -- {{child_name}}, {{amount}}, {{date}} и т.п. — подстановка на отправке.
  body        jsonb not null default '{"ky":"","ru":"","en":""}'::jsonb,
  is_active   boolean not null default true
);

comment on table public.notification_templates is
  'Тексты уведомлений на трёх языках — правятся в CRM, без деплоя.';

alter table public.notification_templates enable row level security;

create policy "notification_templates_all_office"
  on public.notification_templates for all to authenticated
  using (public.is_office()) with check (public.is_office());

create table public.notification_queue (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references public.profiles (id) on delete cascade,
  channel       public.notification_channel not null,
  template_key  text references public.notification_templates (key) on delete set null,
  payload       jsonb not null default '{}'::jsonb,
  status        public.notification_status not null default 'queued',
  attempts      smallint not null default 0,
  last_error    text,
  created_at    timestamptz not null default now(),
  sent_at       timestamptz
);

comment on table public.notification_queue is
  'Единая очередь на все каналы. WhatsApp — просто ещё один channel: пока Meta
   не подтвердила бизнес-аккаунт, письма идут на email/in_app, а очередь и код
   отправки не меняются вовсе — переключается только адаптер на воркере.';

create index notification_queue_pending_idx on public.notification_queue (status, created_at)
  where status = 'queued';
create index notification_queue_recipient_idx on public.notification_queue (recipient_id, created_at desc);

alter table public.notification_queue enable row level security;

create policy "notification_queue_select_own"
  on public.notification_queue for select to authenticated
  using (recipient_id = (select auth.uid()));

create policy "notification_queue_all_office"
  on public.notification_queue for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- Постановка в очередь — обёрнута в функцию, а не голый insert: единая точка,
-- которую вызывают все триггеры ниже, и единое место добавить, например, дедупликацию.
create or replace function public.enqueue_notification(
  p_recipient_id uuid,
  p_channel      public.notification_channel,
  p_template_key text,
  p_payload      jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.notification_queue (recipient_id, channel, template_key, payload)
  values (p_recipient_id, p_channel, p_template_key, p_payload)
  returning id into v_id;

  return v_id;
end;
$$;

-- Пропуск урока без уважительной причины → уведомление всем опекунам ребёнка.
create or replace function public.notify_absence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_guardian record;
  v_student_name text;
  v_lesson_date date;
begin
  if new.status <> 'absent' or (tg_op = 'UPDATE' and old.status = 'absent') then
    return new;
  end if;

  select full_name into v_student_name from public.students where id = new.student_id;
  select held_on into v_lesson_date from public.lessons where id = new.lesson_id;

  for v_guardian in
    select guardian_id from public.student_guardians where student_id = new.student_id
  loop
    perform public.enqueue_notification(
      v_guardian.guardian_id,
      'whatsapp',
      'attendance.absent',
      jsonb_build_object('student_name', v_student_name, 'date', v_lesson_date)
    );
  end loop;

  return new;
end;
$$;

create trigger attendance_notify_absence
  after insert or update on public.attendance
  for each row execute function public.notify_absence();

-- Новое объявление для родителей → уведомление всем подходящим по аудитории.
create or replace function public.notify_announcement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient record;
begin
  for v_recipient in
    select distinct p.id
    from public.profiles p
    where
      (new.audience = 'all')
      or (new.audience = 'parents' and p.role = 'parent')
      or (new.audience = 'staff' and p.role in ('admin', 'manager', 'teacher'))
      or (new.audience = 'teachers' and p.role = 'teacher')
      or (
        new.audience = 'class' and p.role = 'parent' and exists (
          select 1 from public.student_guardians sg
          join public.students s on s.id = sg.student_id
          where sg.guardian_id = p.id and s.class_id = new.class_id
        )
      )
  loop
    perform public.enqueue_notification(
      v_recipient.id, 'in_app', 'announcement.published',
      jsonb_build_object('announcement_id', new.id, 'title', new.title)
    );
  end loop;

  return new;
end;
$$;

create trigger announcements_notify
  after insert on public.announcements
  for each row execute function public.notify_announcement();

insert into public.notification_templates (key, channel, body) values
  ('attendance.absent', 'whatsapp', '{"ky":"{{student_name}} бүгүн {{date}} сабакка келген жок.","ru":"{{student_name}} сегодня {{date}} отсутствовал(а) на уроке.","en":"{{student_name}} was absent from class today, {{date}}."}'),
  ('announcement.published', 'in_app', '{"ky":"Жаңы жарыя: {{title}}","ru":"Новое объявление: {{title}}","en":"New announcement: {{title}}"}'),
  ('payment.confirmed', 'whatsapp', '{"ky":"Төлөм кабыл алынды. Рахмат!","ru":"Оплата подтверждена. Спасибо!","en":"Payment confirmed. Thank you!"}'),
  ('invoice.due_soon', 'whatsapp', '{"ky":"{{amount}} сом төлөө мөөнөтү {{date}} жакындап калды.","ru":"Приближается срок оплаты {{amount}} сом — до {{date}}.","en":"Payment of {{amount}} KGS is due by {{date}}."}')
on conflict (key) do nothing;
