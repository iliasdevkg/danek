-- =============================================================================
-- ДАНЕК · 0002 · Контент сайта, педагоги, тарифы и заявки
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Мультиязычный текст
-- -----------------------------------------------------------------------------
-- Три языка живут в одном jsonb, а не в трёх колонках: приложение обращается
-- как title->>locale, а добавление четвёртого языка станет миграцией данных,
-- а не переделкой схемы. Русский обязателен — он же язык отката.

create domain public.i18n_text as jsonb
  check (value ? 'ky' and value ? 'ru' and value ? 'en');

create domain public.i18n_required as jsonb
  check (
    value ? 'ky' and value ? 'ru' and value ? 'en'
    and length(btrim(value ->> 'ru')) > 0
  );

comment on domain public.i18n_required is
  'Значение на трёх языках, где русский заполнен обязательно — на него откатывается сайт.';

-- -----------------------------------------------------------------------------
-- Учебные годы (нужны и публичной странице стоимости, и всей CRM)
-- -----------------------------------------------------------------------------

create table public.academic_years (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  starts_on  date not null,
  ends_on    date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint academic_years_range check (ends_on > starts_on)
);

-- Текущий учебный год ровно один — гарантия на уровне БД, а не соглашения.
create unique index academic_years_single_current_idx
  on public.academic_years ((is_current)) where is_current;

create trigger academic_years_set_updated_at
  before update on public.academic_years
  for each row execute function public.set_updated_at();

alter table public.academic_years enable row level security;

create policy "academic_years_select_all"
  on public.academic_years for select to anon, authenticated using (true);

create policy "academic_years_all_office"
  on public.academic_years for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Предметы
-- -----------------------------------------------------------------------------

create table public.subjects (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  name       public.i18n_required not null,
  color      text not null default '#16324F',
  sort_order smallint not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint subjects_color_hex check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create trigger subjects_set_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();

alter table public.subjects enable row level security;

create policy "subjects_select_all"
  on public.subjects for select to anon, authenticated using (true);

create policy "subjects_all_office"
  on public.subjects for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Педагоги
-- -----------------------------------------------------------------------------
-- Карточка учителя существует независимо от учётной записи: школа публикует
-- педагога на сайте сразу, а логин выдаёт когда дойдут руки.

create table public.teachers (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid unique references public.profiles (id) on delete set null,
  slug             text not null unique,
  full_name        text not null,
  position         public.i18n_required not null,
  bio              public.i18n_text not null default '{"ky":"","ru":"","en":""}',
  photo_path       text,
  teaching_since   date,
  education        public.i18n_text not null default '{"ky":"","ru":"","en":""}',
  is_public        boolean not null default false,
  is_active        boolean not null default true,
  sort_order       smallint not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint teachers_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint teachers_full_name_len check (char_length(full_name) between 2 and 160)
);

comment on column public.teachers.photo_path is
  'Путь внутри бакета Storage, не полный URL: смена домена проекта не ломает фото.';

create index teachers_public_idx
  on public.teachers (sort_order, full_name) where is_public and is_active;

create trigger teachers_set_updated_at
  before update on public.teachers
  for each row execute function public.set_updated_at();

create table public.teacher_subjects (
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  primary key (teacher_id, subject_id)
);

create index teacher_subjects_subject_idx on public.teacher_subjects (subject_id);

alter table public.teachers enable row level security;
alter table public.teacher_subjects enable row level security;

create policy "teachers_select_public"
  on public.teachers for select to anon, authenticated
  using (is_public and is_active);

create policy "teachers_select_staff"
  on public.teachers for select to authenticated using (public.is_staff());

create policy "teachers_all_office"
  on public.teachers for all to authenticated
  using (public.is_office()) with check (public.is_office());

create policy "teacher_subjects_select_all"
  on public.teacher_subjects for select to anon, authenticated using (true);

create policy "teacher_subjects_all_office"
  on public.teacher_subjects for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Новости
-- -----------------------------------------------------------------------------

create table public.news (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        public.i18n_required not null,
  excerpt      public.i18n_text not null default '{"ky":"","ru":"","en":""}',
  body         public.i18n_text not null default '{"ky":"","ru":"","en":""}',
  cover_path   text,
  published_at timestamptz,
  is_published boolean not null default false,
  author_id    uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint news_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Опубликованная новость обязана иметь дату: сортировка ленты не должна падать в null.
  constraint news_published_has_date check (not is_published or published_at is not null)
);

create index news_feed_idx on public.news (published_at desc) where is_published;

create trigger news_set_updated_at
  before update on public.news
  for each row execute function public.set_updated_at();

alter table public.news enable row level security;

create policy "news_select_published"
  on public.news for select to anon, authenticated
  using (is_published and published_at <= now());

create policy "news_select_staff"
  on public.news for select to authenticated using (public.is_staff());

create policy "news_all_office"
  on public.news for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Галерея
-- -----------------------------------------------------------------------------

create table public.gallery_albums (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        public.i18n_required not null,
  description  public.i18n_text not null default '{"ky":"","ru":"","en":""}',
  cover_path   text,
  happened_on  date,
  is_published boolean not null default false,
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint gallery_albums_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index gallery_albums_published_idx
  on public.gallery_albums (happened_on desc nulls last, sort_order) where is_published;

create trigger gallery_albums_set_updated_at
  before update on public.gallery_albums
  for each row execute function public.set_updated_at();

create table public.gallery_photos (
  id         uuid primary key default gen_random_uuid(),
  album_id   uuid not null references public.gallery_albums (id) on delete cascade,
  path       text not null,
  alt        public.i18n_text not null default '{"ky":"","ru":"","en":""}',
  width      smallint,
  height     smallint,
  blur_data  text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),

  constraint gallery_photos_dimensions check (
    (width is null and height is null) or (width > 0 and height > 0)
  )
);

comment on column public.gallery_photos.blur_data is
  'base64 LQIP-заглушка: фото проявляется без сдвига раскладки, CLS остаётся нулевым.';

create index gallery_photos_album_idx on public.gallery_photos (album_id, sort_order);

alter table public.gallery_albums enable row level security;
alter table public.gallery_photos enable row level security;

create policy "gallery_albums_select_published"
  on public.gallery_albums for select to anon, authenticated using (is_published);

create policy "gallery_albums_select_staff"
  on public.gallery_albums for select to authenticated using (public.is_staff());

create policy "gallery_albums_all_office"
  on public.gallery_albums for all to authenticated
  using (public.is_office()) with check (public.is_office());

create policy "gallery_photos_select_published"
  on public.gallery_photos for select to anon, authenticated
  using (exists (
    select 1 from public.gallery_albums a
    where a.id = album_id and a.is_published
  ));

create policy "gallery_photos_select_staff"
  on public.gallery_photos for select to authenticated using (public.is_staff());

create policy "gallery_photos_all_office"
  on public.gallery_photos for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Тарифы обучения
-- -----------------------------------------------------------------------------

create type public.tuition_period as enum ('monthly', 'quarterly', 'yearly');

create table public.tuition_plans (
  id               uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years (id) on delete cascade,
  name             public.i18n_required not null,
  note             public.i18n_text not null default '{"ky":"","ru":"","en":""}',
  grade_from       smallint not null,
  grade_to         smallint not null,
  amount_kgs       numeric(12, 2) not null,
  period           public.tuition_period not null default 'monthly',
  is_public        boolean not null default true,
  sort_order       smallint not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint tuition_plans_grades check (grade_from between 1 and 11 and grade_to between grade_from and 11),
  constraint tuition_plans_amount check (amount_kgs >= 0)
);

create index tuition_plans_year_idx on public.tuition_plans (academic_year_id, sort_order);

create trigger tuition_plans_set_updated_at
  before update on public.tuition_plans
  for each row execute function public.set_updated_at();

alter table public.tuition_plans enable row level security;

create policy "tuition_plans_select_public"
  on public.tuition_plans for select to anon, authenticated using (is_public);

create policy "tuition_plans_select_staff"
  on public.tuition_plans for select to authenticated using (public.is_staff());

create policy "tuition_plans_all_office"
  on public.tuition_plans for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Заявки на поступление
-- -----------------------------------------------------------------------------

create type public.application_status as enum (
  'new',
  'contacted',
  'trial_scheduled',
  'trial_done',
  'accepted',
  'enrolled',
  'rejected',
  'lost'
);

create type public.application_source as enum (
  'website', 'instagram', 'facebook', 'whatsapp', 'referral', 'walk_in', 'phone', 'other'
);

create table public.applications (
  id               uuid primary key default gen_random_uuid(),
  status           public.application_status not null default 'new',
  source           public.application_source not null default 'website',

  child_name       text not null,
  child_birth_date date,
  grade_level      smallint,

  parent_name      text not null,
  parent_phone     text not null,
  parent_email     extensions.citext,
  message          text,

  assigned_to      uuid references public.profiles (id) on delete set null,
  trial_at         timestamptz,
  student_id       uuid,                       -- заполнится в 0003, когда появятся ученики
  rejection_reason text,

  locale           public.locale_code not null default 'ru',
  utm              jsonb not null default '{}'::jsonb,
  referrer         text,
  submitted_ip     inet,                       -- только для антиспама, наружу не отдаётся

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint applications_child_name_len check (char_length(child_name) between 2 and 160),
  constraint applications_parent_name_len check (char_length(parent_name) between 2 and 160),
  constraint applications_phone_format check (parent_phone ~ '^\+996[0-9]{9}$'),
  constraint applications_grade check (grade_level is null or grade_level between 1 and 11),
  constraint applications_message_len check (message is null or char_length(message) <= 2000)
);

comment on table public.applications is
  'Воронка приёма. Заявка с сайта попадает сюда напрямую — без ручного переноса.';

create index applications_board_idx on public.applications (status, created_at desc);
create index applications_assigned_idx on public.applications (assigned_to, status)
  where assigned_to is not null;
-- Индекс под антиспам: считаем недавние заявки с того же номера.
create index applications_phone_recent_idx on public.applications (parent_phone, created_at desc);
create index applications_ip_recent_idx on public.applications (submitted_ip, created_at desc)
  where submitted_ip is not null;

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

create type public.application_event_type as enum (
  'note', 'call', 'status_change', 'message', 'trial_scheduled'
);

create table public.application_events (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  type           public.application_event_type not null default 'note',
  body           text,
  from_status    public.application_status,
  to_status      public.application_status,
  author_id      uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now()
);

create index application_events_app_idx
  on public.application_events (application_id, created_at desc);

-- Смена статуса сама пишется в историю: менеджер не может «забыть» отметить.
create or replace function public.log_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_events
      (application_id, type, from_status, to_status, author_id)
    values
      (new.id, 'status_change', old.status, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;

create trigger applications_log_status_change
  after update on public.applications
  for each row execute function public.log_application_status_change();

alter table public.applications enable row level security;
alter table public.application_events enable row level security;

-- Анонимная отправка формы разрешена, но только в самом безопасном виде:
-- статус строго 'new', источник строго 'website', менеджер не назначен.
-- Подобрать чужую заявку или сразу «зачислить» ребёнка через API нельзя.
create policy "applications_insert_public"
  on public.applications for insert
  to anon, authenticated
  with check (
    status = 'new'
    and source = 'website'
    and assigned_to is null
    and student_id is null
    and trial_at is null
  );

create policy "applications_select_office"
  on public.applications for select to authenticated using (public.is_office());

create policy "applications_update_office"
  on public.applications for update to authenticated
  using (public.is_office()) with check (public.is_office());

create policy "applications_delete_admin"
  on public.applications for delete to authenticated using (public.is_admin());

create policy "application_events_select_office"
  on public.application_events for select to authenticated using (public.is_office());

create policy "application_events_insert_office"
  on public.application_events for insert to authenticated
  with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Антиспам публичной формы
-- -----------------------------------------------------------------------------
-- Проверка выполняется до вставки в серверном действии. SECURITY DEFINER нужен,
-- чтобы аноним мог узнать «слишком часто», не получая доступа к самим заявкам.

create or replace function public.application_rate_exceeded(
  p_phone text,
  p_ip    inet
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      select count(*) from public.applications
      where parent_phone = p_phone and created_at > now() - interval '1 hour'
    ) >= 3
    or
    (
      p_ip is not null and (
        select count(*) from public.applications
        where submitted_ip = p_ip and created_at > now() - interval '1 hour'
      ) >= 8
    );
$$;

grant execute on function public.application_rate_exceeded(text, inet) to anon, authenticated;
