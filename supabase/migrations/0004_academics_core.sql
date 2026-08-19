-- =============================================================================
-- ДАНЕК · 0004 · Классы, ученики, родители — ядро CRM
-- =============================================================================

-- Триграммный индекс для поиска учеников «на лету» по части ФИО в CRM.
create extension if not exists "pg_trgm" with schema extensions;

create type public.student_status as enum ('active', 'graduated', 'expelled', 'academic_leave');
create type public.guardian_relation as enum ('mother', 'father', 'grandmother', 'grandfather', 'guardian', 'other');

-- -----------------------------------------------------------------------------
-- Классы
-- -----------------------------------------------------------------------------

create table public.classes (
  id                uuid primary key default gen_random_uuid(),
  academic_year_id  uuid not null references public.academic_years (id) on delete cascade,
  grade_level       smallint not null,
  -- Литера — «А», «Б»… Кыргызская школа привычно использует латиницу/кириллицу вперемешку,
  -- поэтому это свободный текст в одну-две буквы, а не enum.
  letter            text not null,
  homeroom_teacher_id uuid references public.teachers (id) on delete set null,
  capacity          smallint not null default 25,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint classes_grade check (grade_level between 1 and 11),
  constraint classes_letter_len check (char_length(letter) between 1 and 2),
  constraint classes_capacity check (capacity between 1 and 60),
  unique (academic_year_id, grade_level, letter)
);

comment on table public.classes is
  'Класс существует в рамках одного учебного года — «5А в 2026/2027» это отдельная строка от «5А в 2027/2028».';

create index classes_year_idx on public.classes (academic_year_id, grade_level, letter);
create index classes_homeroom_idx on public.classes (homeroom_teacher_id) where homeroom_teacher_id is not null;

create trigger classes_set_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Ученики
-- -----------------------------------------------------------------------------

create table public.students (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid unique references public.profiles (id) on delete set null,
  full_name         text not null,
  birth_date        date,
  class_id          uuid references public.classes (id) on delete set null,
  status            public.student_status not null default 'active',
  enrolled_on       date not null default current_date,
  photo_path        text,
  notes             text,
  application_id    uuid references public.applications (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint students_full_name_len check (char_length(full_name) between 2 and 160),
  constraint students_notes_len check (notes is null or char_length(notes) <= 4000)
);

comment on table public.students is
  'Личное дело ученика. profile_id заполняется, когда ученику выдают логин — многие младшие
   ученики входят через кабинет родителя и своего логина не имеют вовсе.';

create index students_class_idx on public.students (class_id) where status = 'active';
create index students_status_idx on public.students (status);
create index students_name_search_idx on public.students using gin (full_name extensions.gin_trgm_ops);

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- Теперь, когда students существует, привязываем к ней отложенный внешний ключ
-- из applications (миграция 0002 создавала student_id как «сырой» uuid).
alter table public.applications
  add constraint applications_student_fk foreign key (student_id)
  references public.students (id) on delete set null;

-- -----------------------------------------------------------------------------
-- Родители ↔ ученики
-- -----------------------------------------------------------------------------

create table public.student_guardians (
  student_id   uuid not null references public.students (id) on delete cascade,
  guardian_id  uuid not null references public.profiles (id) on delete cascade,
  relation     public.guardian_relation not null default 'other',
  is_primary   boolean not null default false,
  can_pick_up  boolean not null default true,
  created_at   timestamptz not null default now(),

  primary key (student_id, guardian_id)
);

comment on table public.student_guardians is
  'Связь многие-ко-многим: у ребёнка может быть несколько опекунов, у родителя — несколько детей.';

-- Один основной контакт на ребёнка — куда в первую очередь звонит классный руководитель.
create unique index student_guardians_one_primary_idx
  on public.student_guardians (student_id) where is_primary;

create index student_guardians_guardian_idx on public.student_guardians (guardian_id);

-- -----------------------------------------------------------------------------
-- История переводов между классами
-- -----------------------------------------------------------------------------

create table public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students (id) on delete cascade,
  class_id     uuid not null references public.classes (id) on delete cascade,
  started_on   date not null default current_date,
  ended_on     date,
  reason       text,
  created_at   timestamptz not null default now(),

  constraint enrollments_range check (ended_on is null or ended_on >= started_on)
);

comment on table public.enrollments is
  'Журнал переводов: «был в 4Б до 12 мая, потом в 4А». students.class_id — это просто
   текущее значение, здесь — вся история, которая нужна для табеля и отчётов.';

create index enrollments_student_idx on public.enrollments (student_id, started_on desc);
create index enrollments_class_idx on public.enrollments (class_id) where ended_on is null;

-- Ровно одна открытая запись зачисления на ученика — иначе непонятно, в каком он классе.
create unique index enrollments_one_open_idx
  on public.enrollments (student_id) where ended_on is null;

-- Перевод ученика в другой класс: закрывает старое зачисление и открывает новое одной операцией.
create or replace function public.transfer_student(
  p_student_id uuid,
  p_class_id   uuid,
  p_reason     text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_office() then
    raise exception 'Перевод ученика доступен только офису' using errcode = '42501';
  end if;

  update public.enrollments
    set ended_on = current_date, reason = coalesce(p_reason, reason)
    where student_id = p_student_id and ended_on is null;

  insert into public.enrollments (student_id, class_id, started_on, reason)
    values (p_student_id, p_class_id, current_date, p_reason);

  update public.students set class_id = p_class_id where id = p_student_id;
end;
$$;

grant execute on function public.transfer_student(uuid, uuid, text) to authenticated;

-- Зачисление нового ученика создаёт первую запись автоматически.
create or replace function public.log_initial_enrollment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.class_id is not null then
    insert into public.enrollments (student_id, class_id, started_on)
    values (new.id, new.class_id, new.enrolled_on)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger students_log_initial_enrollment
  after insert on public.students
  for each row execute function public.log_initial_enrollment();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.student_guardians enable row level security;
alter table public.enrollments enable row level security;

-- Хелперы доступа для родителя/учителя/ученика — используются здесь и во всех
-- следующих миграциях (расписание, журнал, финансы).

create or replace function public.guardian_of(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.student_guardians
    where student_id = p_student_id and guardian_id = (select auth.uid())
  );
$$;

-- Пока среди учителей класса известен только классный руководитель — предметники
-- добавятся тем же CREATE OR REPLACE в 0005, когда появится таблица расписания.
create or replace function public.teaches_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.classes c
    join public.teachers t on t.id = c.homeroom_teacher_id
    where c.id = p_class_id and t.profile_id = (select auth.uid())
  );
$$;

create or replace function public.is_own_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.students s
    where s.id = p_student_id and s.profile_id = (select auth.uid())
  );
$$;

grant execute on function public.guardian_of(uuid) to authenticated;
grant execute on function public.teaches_class(uuid) to authenticated;
grant execute on function public.is_own_student(uuid) to authenticated;

-- Классы

create policy "classes_select_staff"
  on public.classes for select to authenticated using (public.is_staff());

create policy "classes_all_office"
  on public.classes for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- Ученики

create policy "students_select_staff"
  on public.students for select to authenticated using (public.is_staff());

create policy "students_select_own_child"
  on public.students for select to authenticated
  using (public.auth_role() = 'parent' and public.guardian_of(id));

create policy "students_select_self"
  on public.students for select to authenticated
  using (public.auth_role() = 'student' and public.is_own_student(id));

create policy "students_all_office"
  on public.students for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- Родители ↔ ученики

create policy "guardians_select_staff"
  on public.student_guardians for select to authenticated using (public.is_staff());

create policy "guardians_select_own"
  on public.student_guardians for select to authenticated
  using (guardian_id = (select auth.uid()));

create policy "guardians_all_office"
  on public.student_guardians for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- История зачислений

create policy "enrollments_select_staff"
  on public.enrollments for select to authenticated using (public.is_staff());

create policy "enrollments_select_own_child"
  on public.enrollments for select to authenticated
  using (public.auth_role() = 'parent' and public.guardian_of(student_id));

create policy "enrollments_all_office"
  on public.enrollments for all to authenticated
  using (public.is_office()) with check (public.is_office());
