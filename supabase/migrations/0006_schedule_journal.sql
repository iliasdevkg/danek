-- =============================================================================
-- ДАНЕК · 0006 · Расписание, посещаемость, оценки
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Учебные периоды: год делится на четверти, у каждой — свой диапазон дат.
-- -----------------------------------------------------------------------------

create table public.terms (
  id                uuid primary key default gen_random_uuid(),
  academic_year_id  uuid not null references public.academic_years (id) on delete cascade,
  -- 1..4 — четверти. Пятая, летняя, не нужна: обучение идёт по учебному году.
  number            smallint not null,
  starts_on         date not null,
  ends_on           date not null,
  created_at        timestamptz not null default now(),

  constraint terms_number check (number between 1 and 4),
  constraint terms_range check (ends_on > starts_on),
  unique (academic_year_id, number)
);

comment on table public.terms is
  'Четверти учебного года — единица, к которой привязаны итоговые оценки и начисления.';

create index terms_year_idx on public.terms (academic_year_id, number);

alter table public.terms enable row level security;

create policy "terms_select_all"
  on public.terms for select to anon, authenticated using (true);

create policy "terms_all_office"
  on public.terms for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Звонки: сетка времени уроков, общая для всей школы.
-- -----------------------------------------------------------------------------

create table public.lesson_slots (
  id           uuid primary key default gen_random_uuid(),
  -- Порядковый номер урока в дне — 1, 2, 3… Используется как якорь сетки расписания.
  position     smallint not null unique,
  starts_at    time not null,
  ends_at      time not null,

  constraint lesson_slots_range check (ends_at > starts_at),
  constraint lesson_slots_position check (position between 1 and 12)
);

comment on table public.lesson_slots is
  'Общешкольные звонки. Один и тот же 3-й урок у 5А и у 9Б начинается в одно время.';

alter table public.lesson_slots enable row level security;

create policy "lesson_slots_select_all"
  on public.lesson_slots for select to anon, authenticated using (true);

create policy "lesson_slots_all_office"
  on public.lesson_slots for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Расписание: постоянная сетка на неделю.
-- -----------------------------------------------------------------------------

create type public.weekday as enum ('mon', 'tue', 'wed', 'thu', 'fri', 'sat');

create table public.schedule_entries (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes (id) on delete cascade,
  subject_id    uuid not null references public.subjects (id) on delete cascade,
  teacher_id    uuid not null references public.teachers (id) on delete cascade,
  weekday       public.weekday not null,
  lesson_slot_id uuid not null references public.lesson_slots (id) on delete cascade,
  room          text,
  created_at    timestamptz not null default now(),

  -- Один и тот же класс не может в это же время сидеть на двух уроках сразу.
  unique (class_id, weekday, lesson_slot_id)
);

comment on table public.schedule_entries is
  'Постоянное расписание: «5А, понедельник, 3-й урок → математика, Иванова И.И.».
   Конфликт учителя (тот же преподаватель в это же время в другом классе)
   ловится триггером ниже — уникального индекса недостаточно, потому что
   учитель и класс — разные колонки.';

create index schedule_entries_class_idx on public.schedule_entries (class_id, weekday, lesson_slot_id);
create index schedule_entries_teacher_idx on public.schedule_entries (teacher_id, weekday, lesson_slot_id);

-- Учитель не может вести два урока одновременно в разных классах.
create or replace function public.check_teacher_schedule_conflict()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.schedule_entries se
    where se.teacher_id = new.teacher_id
      and se.weekday = new.weekday
      and se.lesson_slot_id = new.lesson_slot_id
      and se.id is distinct from new.id
      and se.class_id is distinct from new.class_id
  ) then
    raise exception 'Учитель уже ведёт урок в это время в другом классе'
      using errcode = '23P01';
  end if;
  return new;
end;
$$;

create trigger schedule_entries_check_conflict
  before insert or update on public.schedule_entries
  for each row execute function public.check_teacher_schedule_conflict();

alter table public.schedule_entries enable row level security;

create policy "schedule_select_staff"
  on public.schedule_entries for select to authenticated using (public.is_staff());

-- Родитель и ученик видят расписание своего класса — без этого дневник бесполезен.
create policy "schedule_select_own_class"
  on public.schedule_entries for select to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.class_id = schedule_entries.class_id
        and (public.is_own_student(s.id) or public.guardian_of(s.id))
    )
  );

create policy "schedule_all_office"
  on public.schedule_entries for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- Теперь, когда расписание существует, учитель-предметник тоже получает
-- доступ к своему классу — не только классный руководитель (см. 0004).
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
  )
  or exists (
    select 1 from public.schedule_entries se
    join public.teachers t on t.id = se.teacher_id
    where se.class_id = p_class_id and t.profile_id = (select auth.uid())
  );
$$;

-- -----------------------------------------------------------------------------
-- Проведённые уроки
-- -----------------------------------------------------------------------------

create table public.lessons (
  id                 uuid primary key default gen_random_uuid(),
  schedule_entry_id  uuid not null references public.schedule_entries (id) on delete cascade,
  held_on            date not null,
  topic              text,
  homework           text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- Один и тот же урок по расписанию не проводится дважды в один день.
  unique (schedule_entry_id, held_on)
);

comment on table public.lessons is
  'Конкретное занятие в конкретный день — то, на что учитель ставит посещаемость и оценки.
   Создаётся автоматически при первом открытии журнала на эту дату (см. lib/actions/journal.ts).';

create index lessons_date_idx on public.lessons (held_on desc);
create index lessons_entry_idx on public.lessons (schedule_entry_id, held_on desc);

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

alter table public.lessons enable row level security;

create policy "lessons_select_staff"
  on public.lessons for select to authenticated using (public.is_staff());

create policy "lessons_select_own_class"
  on public.lessons for select to authenticated
  using (
    exists (
      select 1 from public.schedule_entries se
      join public.students s on s.class_id = se.class_id
      where se.id = lessons.schedule_entry_id
        and (public.is_own_student(s.id) or public.guardian_of(s.id))
    )
  );

create policy "lessons_write_own_class"
  on public.lessons for all to authenticated
  using (
    public.is_office()
    or exists (
      select 1 from public.schedule_entries se
      where se.id = lessons.schedule_entry_id and public.teaches_class(se.class_id)
    )
  )
  with check (
    public.is_office()
    or exists (
      select 1 from public.schedule_entries se
      where se.id = lessons.schedule_entry_id and public.teaches_class(se.class_id)
    )
  );

-- -----------------------------------------------------------------------------
-- Посещаемость
-- -----------------------------------------------------------------------------

create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');

create table public.attendance (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons (id) on delete cascade,
  student_id  uuid not null references public.students (id) on delete cascade,
  status      public.attendance_status not null default 'present',
  note        text,
  marked_by   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (lesson_id, student_id)
);

create index attendance_student_idx on public.attendance (student_id, created_at desc);
-- Быстрый ответ на «сколько пропусков у Ученика А за четверть» без full scan.
create index attendance_absent_idx on public.attendance (student_id) where status in ('absent', 'late');

create trigger attendance_set_updated_at
  before update on public.attendance
  for each row execute function public.set_updated_at();

alter table public.attendance enable row level security;

create policy "attendance_select_staff"
  on public.attendance for select to authenticated using (public.is_staff());

create policy "attendance_select_own"
  on public.attendance for select to authenticated
  using (public.is_own_student(student_id) or public.guardian_of(student_id));

create policy "attendance_write_teacher"
  on public.attendance for all to authenticated
  using (
    public.is_office()
    or exists (
      select 1 from public.lessons l
      join public.schedule_entries se on se.id = l.schedule_entry_id
      where l.id = attendance.lesson_id and public.teaches_class(se.class_id)
    )
  )
  with check (
    public.is_office()
    or exists (
      select 1 from public.lessons l
      join public.schedule_entries se on se.id = l.schedule_entry_id
      where l.id = attendance.lesson_id and public.teaches_class(se.class_id)
    )
  );

-- -----------------------------------------------------------------------------
-- Оценки
-- -----------------------------------------------------------------------------

create type public.grade_kind as enum ('lesson', 'homework', 'test', 'term', 'exam');

create table public.grade_entries (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid references public.lessons (id) on delete cascade,
  student_id  uuid not null references public.students (id) on delete cascade,
  subject_id  uuid not null references public.subjects (id) on delete cascade,
  term_id     uuid not null references public.terms (id) on delete cascade,
  kind        public.grade_kind not null default 'lesson',
  -- Пятибалльная система: 2..5. Единицу в кыргызской школе на практике не ставят,
  -- отсутствие оценки — это отсутствие строки, а не 0 или 1.
  value       smallint not null,
  comment     text,
  marked_by   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint grade_entries_value check (value between 2 and 5)
);

comment on table public.grade_entries is
  'Любая отдельная оценка — за урок, домашку, контрольную. term_id обязателен
   даже для одной оценки за урок: без него нельзя посчитать четвертной балл.';

create index grade_entries_student_idx on public.grade_entries (student_id, term_id, subject_id);
create index grade_entries_lesson_idx on public.grade_entries (lesson_id) where lesson_id is not null;

create trigger grade_entries_set_updated_at
  before update on public.grade_entries
  for each row execute function public.set_updated_at();

alter table public.grade_entries enable row level security;

create policy "grade_entries_select_staff"
  on public.grade_entries for select to authenticated using (public.is_staff());

create policy "grade_entries_select_own"
  on public.grade_entries for select to authenticated
  using (public.is_own_student(student_id) or public.guardian_of(student_id));

create policy "grade_entries_write_teacher"
  on public.grade_entries for all to authenticated
  using (
    public.is_office()
    or exists (
      select 1 from public.students s where s.id = grade_entries.student_id and public.teaches_class(s.class_id)
    )
  )
  with check (
    public.is_office()
    or exists (
      select 1 from public.students s where s.id = grade_entries.student_id and public.teaches_class(s.class_id)
    )
  );

-- -----------------------------------------------------------------------------
-- Итоговые оценки за четверть — пересчитываются автоматически.
-- -----------------------------------------------------------------------------

create table public.term_grades (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students (id) on delete cascade,
  subject_id  uuid not null references public.subjects (id) on delete cascade,
  term_id     uuid not null references public.terms (id) on delete cascade,
  -- Округлённое среднее по всем grade_entries — то, что реально идёт в табель.
  average     numeric(3, 2),
  final_value smallint,
  updated_at  timestamptz not null default now(),

  constraint term_grades_final_range check (final_value is null or final_value between 2 and 5),
  unique (student_id, subject_id, term_id)
);

comment on table public.term_grades is
  'Витрина для табеля: одна строка на ученика/предмет/четверть вместо пересчёта
   среднего на каждый рендер страницы. Обновляется триггером с grade_entries.';

alter table public.term_grades enable row level security;

create policy "term_grades_select_staff"
  on public.term_grades for select to authenticated using (public.is_staff());

create policy "term_grades_select_own"
  on public.term_grades for select to authenticated
  using (public.is_own_student(student_id) or public.guardian_of(student_id));

create policy "term_grades_all_office"
  on public.term_grades for all to authenticated
  using (public.is_office()) with check (public.is_office());

-- Пересчёт среднего при любом изменении оценки. round-half-up до целого —
-- обычная кыргызская практика «4.5 округляется до 5».
create or replace function public.recalc_term_grade()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student  uuid := coalesce(new.student_id, old.student_id);
  v_subject  uuid := coalesce(new.subject_id, old.subject_id);
  v_term     uuid := coalesce(new.term_id, old.term_id);
  v_average  numeric(3, 2);
begin
  select round(avg(value)::numeric, 2) into v_average
  from public.grade_entries
  where student_id = v_student and subject_id = v_subject and term_id = v_term;

  insert into public.term_grades (student_id, subject_id, term_id, average, final_value, updated_at)
  values (v_student, v_subject, v_term, v_average, round(v_average), now())
  on conflict (student_id, subject_id, term_id)
  do update set average = excluded.average, final_value = excluded.final_value, updated_at = now();

  return null;
end;
$$;

create trigger grade_entries_recalc_term
  after insert or update or delete on public.grade_entries
  for each row execute function public.recalc_term_grade();

-- -----------------------------------------------------------------------------
-- Хелпер: создать урок «сейчас», если его ещё нет — вызывается из журнала.
-- -----------------------------------------------------------------------------

create or replace function public.open_lesson(
  p_schedule_entry_id uuid,
  p_held_on           date
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_lesson_id uuid;
  v_class_id  uuid;
begin
  select class_id into v_class_id from public.schedule_entries where id = p_schedule_entry_id;

  if v_class_id is null or not public.teaches_class(v_class_id) then
    raise exception 'Урок доступен только ведущему его учителю' using errcode = '42501';
  end if;

  insert into public.lessons (schedule_entry_id, held_on)
  values (p_schedule_entry_id, p_held_on)
  on conflict (schedule_entry_id, held_on) do update set held_on = excluded.held_on
  returning id into v_lesson_id;

  return v_lesson_id;
end;
$$;

grant execute on function public.open_lesson(uuid, date) to authenticated;
