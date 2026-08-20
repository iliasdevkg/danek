-- =============================================================================
-- Демонстрационное наполнение для локальной разработки и показа школе.
--
-- Запускается автоматически при `supabase db reset` — после всех миграций.
-- Данные вымышленные: имена, телефоны и суммы придуманы. Настоящие только
-- предметы, ступени и порядок работы — они взяты из того, как школа реально
-- устроена, иначе демонстрация не показывала бы ничего полезного.
--
-- Даты считаются от current_date, а не записаны числами: сид не протухает,
-- и журнал через полгода всё так же показывает «последние недели», а не
-- пустую сетку за позапрошлый учебный год.
--
-- Все учётные записи с паролем danek2026.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Учётные записи
--
-- Профиль создаётся триггером on_auth_user_created: роль он берёт из
-- raw_app_meta_data.role, имя и телефон — из raw_user_meta_data. Поэтому
-- profiles здесь не заполняется руками, иначе роль пришлось бы держать
-- в двух местах и они бы разъезжались.
-- -----------------------------------------------------------------------------

-- Пустые строки в токенах — не косметика.
--
-- Supabase Auth читает эти колонки в Go-структуру с полем string и падает на
-- NULL: «converting NULL to string is unsupported», а наружу это выходит как
-- «Database error querying schema» при любой попытке входа. Обычная регистрация
-- проставляет их сама; когда пользователь заводится через SQL, о них надо
-- позаботиться руками.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select
  v.instance_id, v.id, v.aud, v.role, v.email, v.encrypted_password, v.email_confirmed_at,
  v.raw_app_meta_data, v.raw_user_meta_data, v.created_at, v.updated_at,
  '', '', '', '', '', '', '', ''
from (values
  -- Типы задаёт первая строка списка: дальше Postgres выводит их сам.
  ('00000000-0000-0000-0000-000000000000'::uuid, '10000000-0000-4000-8000-000000000001'::uuid,
   'authenticated', 'authenticated', 'director@danek.local',
   extensions.crypt('danek2026', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
   '{"full_name":"Талантбек Сапитов","phone":"+996770277123","locale":"ru"}'::jsonb, now(), now()),

  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'manager@danek.local',
   extensions.crypt('danek2026', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"role":"manager"}',
   '{"full_name":"Айнура Осмонова","phone":"+996700111222","locale":"ru"}', now(), now()),

  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000003',
   'authenticated', 'authenticated', 'teacher@danek.local',
   extensions.crypt('danek2026', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"role":"teacher"}',
   '{"full_name":"Нурлан Абдырахманов","phone":"+996555333444","locale":"ru"}', now(), now()),

  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000004',
   'authenticated', 'authenticated', 'parent@danek.local',
   extensions.crypt('danek2026', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"role":"parent"}',
   '{"full_name":"Гүлмира Асанова","phone":"+996777888999","locale":"ky"}', now(), now()),

  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000005',
   'authenticated', 'authenticated', 'student@danek.local',
   extensions.crypt('danek2026', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"role":"student"}',
   '{"full_name":"Алина Асанова","locale":"ru"}', now(), now())
) as v (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
);

-- Без записи в identities GoTrue не находит пользователя по паролю.
insert into auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
select
  u.id, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', u.id::text, now(), now(), now()
from auth.users u
where u.email like '%@danek.local';

-- -----------------------------------------------------------------------------
-- 2. Учебный год и четверти
-- -----------------------------------------------------------------------------

insert into public.academic_years (id, name, starts_on, ends_on, is_current)
values (
  '20000000-0000-4000-8000-000000000001',
  to_char(current_date - interval '11 months', 'YYYY') || '/' || to_char(current_date + interval '1 month', 'YYYY'),
  (current_date - interval '11 months')::date,
  (current_date + interval '1 month')::date,
  true
);

-- Четыре четверти равными долями учебного года.
insert into public.terms (id, academic_year_id, number, starts_on, ends_on)
select
  ('20000000-0000-4000-8000-00000000001' || n)::uuid,
  '20000000-0000-4000-8000-000000000001',
  n,
  (current_date - interval '11 months' + (n - 1) * interval '3 months')::date,
  (current_date - interval '11 months' + n * interval '3 months' - interval '1 day')::date
from generate_series(1, 4) as n;

-- -----------------------------------------------------------------------------
-- 3. Предметы
-- -----------------------------------------------------------------------------

insert into public.subjects (id, code, name, color, sort_order) values
  ('20000000-0000-4000-8000-000000000101', 'eng',  '{"ky":"Англис тили","ru":"Английский язык","en":"English"}', '#16336B', 1),
  ('20000000-0000-4000-8000-000000000102', 'math', '{"ky":"Математика","ru":"Математика","en":"Mathematics"}', '#10864E', 2),
  ('20000000-0000-4000-8000-000000000103', 'ara',  '{"ky":"Араб тили","ru":"Арабский язык","en":"Arabic"}', '#96610A', 3),
  ('20000000-0000-4000-8000-000000000104', 'kyr',  '{"ky":"Кыргыз тили","ru":"Кыргызский язык","en":"Kyrgyz"}', '#16336B', 4),
  ('20000000-0000-4000-8000-000000000105', 'rus',  '{"ky":"Орус тили","ru":"Русский язык","en":"Russian"}', '#16336B', 5),
  ('20000000-0000-4000-8000-000000000106', 'fin',  '{"ky":"Каржы сабаттуулугу","ru":"Финансовая грамотность","en":"Financial literacy"}', '#10864E', 6),
  ('20000000-0000-4000-8000-000000000107', 'eth',  '{"ky":"Этика (адеп-ахлак)","ru":"Этика (адеп-ахлак)","en":"Ethics"}', '#96610A', 7),
  ('20000000-0000-4000-8000-000000000108', 'inf',  '{"ky":"Информатика","ru":"Информатика","en":"Computer science"}', '#10864E', 8),
  ('20000000-0000-4000-8000-000000000109', 'bio',  '{"ky":"Биология","ru":"Биология","en":"Biology"}', '#10864E', 9),
  ('20000000-0000-4000-8000-000000000110', 'his',  '{"ky":"Тарых","ru":"История","en":"History"}', '#96610A', 10),
  ('20000000-0000-4000-8000-000000000111', 'pe',   '{"ky":"Дене тарбия","ru":"Физкультура","en":"Physical education"}', '#10864E', 11);

-- -----------------------------------------------------------------------------
-- 4. Педагоги
--
-- Директор и предметник связаны со своими учётными записями через profile_id —
-- на этом держится роль teacher: учитель видит в журнале только свои классы.
-- -----------------------------------------------------------------------------

insert into public.teachers (id, profile_id, slug, full_name, position, bio, teaching_since, is_public, sort_order) values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'talantbek-sapitov', 'Талантбек Сапитов',
   '{"ky":"Мектеп директору","ru":"Директор школы","en":"School Director"}',
   '{"ky":"Мектепти башкарат жана мугалимдерди тандайт.","ru":"Отвечает за развитие комплекса и отбор педагогов.","en":"Leads the school and hires teachers."}',
   (current_date - interval '18 years')::date, true, 1),

  ('30000000-0000-4000-8000-000000000002', null, 'aigerim-osmonova', 'Айгерим Осмонова',
   '{"ky":"Англис тили боюнча жетекчи","ru":"Руководитель направления «Английский язык»","en":"Head of English"}',
   '{"ky":"IELTS 6.5+ даярдыгын жүргүзөт.","ru":"Ведёт подготовку к IELTS от 6.5 балла.","en":"Runs IELTS preparation from band 6.5."}',
   (current_date - interval '12 years')::date, true, 2),

  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'nurlan-abdyrahmanov', 'Нурлан Абдырахманов',
   '{"ky":"Математика боюнча жетекчи","ru":"Руководитель направления «Математика»","en":"Head of Mathematics"}',
   '{"ky":"Республикалык олимпиадага даярдайт.","ru":"Готовит к республиканским олимпиадам и ведёт курс ОРТ.","en":"Prepares students for national olympiads."}',
   (current_date - interval '15 years')::date, true, 3),

  ('30000000-0000-4000-8000-000000000004', null, 'zhyldyz-toktosunova', 'Жылдыз Токтосунова',
   '{"ky":"Башталгыч класстардын мугалими","ru":"Учитель начальных классов","en":"Primary School Teacher"}',
   '{"ky":"1–4-класстар.","ru":"1–4 классы. Чтение, счёт и первые английские слова.","en":"Grades 1–4."}',
   (current_date - interval '9 years')::date, true, 4),

  ('30000000-0000-4000-8000-000000000005', null, 'azamat-kadyrov', 'Азамат Кадыров',
   '{"ky":"Араб тилинин мугалими","ru":"Учитель арабского языка","en":"Arabic Teacher"}',
   '{"ky":"Араб тили 1-класстан баштап.","ru":"Арабский язык с первого класса.","en":"Arabic from grade 1."}',
   (current_date - interval '7 years')::date, true, 5),

  ('30000000-0000-4000-8000-000000000006', null, 'gulnara-asanova', 'Гүлнара Асанова',
   '{"ky":"Этика мугалими","ru":"Учитель этики (адеп-ахлак)","en":"Ethics Teacher"}',
   '{"ky":"Адеп-ахлак сабагы.","ru":"Уроки адеп-ахлак: уважение и ответственность.","en":"Adep-akhlak lessons."}',
   (current_date - interval '11 years')::date, true, 6);

insert into public.teacher_subjects (teacher_id, subject_id) values
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000101'),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000102'),
  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000103'),
  ('30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000107'),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000104');

-- -----------------------------------------------------------------------------
-- 5. Классы
-- -----------------------------------------------------------------------------

insert into public.classes (id, academic_year_id, grade_level, letter, homeroom_teacher_id, capacity) values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 1, 'А', '30000000-0000-4000-8000-000000000004', 22),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 2, 'А', '30000000-0000-4000-8000-000000000004', 22),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 5, 'А', '30000000-0000-4000-8000-000000000002', 25),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', 7, 'А', '30000000-0000-4000-8000-000000000003', 25),
  ('40000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000001', 9, 'А', '30000000-0000-4000-8000-000000000006', 25);

-- -----------------------------------------------------------------------------
-- 6. Ученики
--
-- Имена собраны из распространённых кыргызских имён и фамилий: по 4–6 человек
-- в классе — достаточно, чтобы журнал и списки выглядели как настоящие, и
-- немного, чтобы их можно было глазами проверить целиком.
-- -----------------------------------------------------------------------------

insert into public.students (id, full_name, birth_date, class_id, status, enrolled_on) values
  -- 1А
  ('50000000-0000-4000-8000-000000000001', 'Айсулуу Бекова',        (current_date - interval '7 years')::date,  '40000000-0000-4000-8000-000000000001', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000002', 'Тимур Жумабеков',       (current_date - interval '7 years')::date,  '40000000-0000-4000-8000-000000000001', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000003', 'Амина Садыкова',        (current_date - interval '7 years')::date,  '40000000-0000-4000-8000-000000000001', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000004', 'Эмир Токтогулов',       (current_date - interval '7 years')::date,  '40000000-0000-4000-8000-000000000001', 'active', (current_date - interval '9 months')::date),
  -- 2А
  ('50000000-0000-4000-8000-000000000005', 'Алина Асанова',         (current_date - interval '8 years')::date,  '40000000-0000-4000-8000-000000000002', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000006', 'Данияр Мурзаев',        (current_date - interval '8 years')::date,  '40000000-0000-4000-8000-000000000002', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000007', 'Айзада Кубанычбекова',  (current_date - interval '8 years')::date,  '40000000-0000-4000-8000-000000000002', 'active', (current_date - interval '11 months')::date),
  -- 5А
  ('50000000-0000-4000-8000-000000000008', 'Нурислам Асылбеков',    (current_date - interval '11 years')::date, '40000000-0000-4000-8000-000000000003', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000009', 'Самир Бакиров',         (current_date - interval '11 years')::date, '40000000-0000-4000-8000-000000000003', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000010', 'Аружан Маратова',       (current_date - interval '11 years')::date, '40000000-0000-4000-8000-000000000003', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000011', 'Бекзат Осмонов',        (current_date - interval '11 years')::date, '40000000-0000-4000-8000-000000000003', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000012', 'Мээрим Абдиева',        (current_date - interval '11 years')::date, '40000000-0000-4000-8000-000000000003', 'active', (current_date - interval '6 months')::date),
  -- 7А
  ('50000000-0000-4000-8000-000000000013', 'Мирзахид Ахматов',      (current_date - interval '13 years')::date, '40000000-0000-4000-8000-000000000004', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000014', 'Айпери Дуйшенова',      (current_date - interval '13 years')::date, '40000000-0000-4000-8000-000000000004', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000015', 'Islam Turgunov',        (current_date - interval '13 years')::date, '40000000-0000-4000-8000-000000000004', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000016', 'Жанель Ибраева',        (current_date - interval '13 years')::date, '40000000-0000-4000-8000-000000000004', 'active', (current_date - interval '11 months')::date),
  -- 9А
  ('50000000-0000-4000-8000-000000000017', 'Адилет Касымов',        (current_date - interval '15 years')::date, '40000000-0000-4000-8000-000000000005', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000018', 'Сезим Нурланова',       (current_date - interval '15 years')::date, '40000000-0000-4000-8000-000000000005', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000019', 'Бегимай Токтосунова',   (current_date - interval '15 years')::date, '40000000-0000-4000-8000-000000000005', 'active', (current_date - interval '11 months')::date),
  ('50000000-0000-4000-8000-000000000020', 'Улан Жээнбеков',        (current_date - interval '15 years')::date, '40000000-0000-4000-8000-000000000005', 'academic_leave', (current_date - interval '11 months')::date);

-- Ученик со своим кабинетом и родитель, который его там видит.
update public.students
   set profile_id = '10000000-0000-4000-8000-000000000005'
 where id = '50000000-0000-4000-8000-000000000005';

insert into public.student_guardians (student_id, guardian_id, relation, is_primary, can_pick_up) values
  ('50000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000004', 'mother', true, true),
  ('50000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000004', 'mother', true, true);

-- Записи о зачислении здесь не создаются: триггер students_log_initial_enrollment
-- уже добавил по одной на каждого ученика с классом, а больше одной открытой
-- записи на ученика схема не допускает.

-- -----------------------------------------------------------------------------
-- 7. Заявки — воронка приёма во всех состояниях
-- -----------------------------------------------------------------------------

insert into public.applications (id, status, source, child_name, child_birth_date, grade_level, parent_name, parent_phone, parent_email, message, assigned_to, trial_at, created_at) values
  ('60000000-0000-4000-8000-000000000001', 'new', 'website', 'Алтынай Эрмекова', (current_date - interval '7 years')::date, 1,
   'Чолпон Эрмекова', '+996700445566', 'cholpon@example.com', 'Хотим в первый класс. Важен английский с начала.', null, null, now() - interval '2 days'),

  ('60000000-0000-4000-8000-000000000002', 'new', 'instagram', 'Санжар Кубатов', (current_date - interval '9 years')::date, 3,
   'Айбек Кубатов', '+996555112233', null, 'Переезжаем из другого района, ищем школу с питанием.', null, null, now() - interval '4 days'),

  ('60000000-0000-4000-8000-000000000003', 'contacted', 'whatsapp', 'Диана Асанова', (current_date - interval '11 years')::date, 5,
   'Нургүл Асанова', '+996772334455', null, null, '10000000-0000-4000-8000-000000000002', null, now() - interval '9 days'),

  ('60000000-0000-4000-8000-000000000004', 'trial_scheduled', 'referral', 'Азизбек Турдубеков', (current_date - interval '13 years')::date, 7,
   'Гулназ Турдубекова', '+996709887766', 'gulnaz@example.com', 'По рекомендации соседей.', '10000000-0000-4000-8000-000000000002', now() + interval '3 days', now() - interval '14 days'),

  ('60000000-0000-4000-8000-000000000005', 'trial_done', 'website', 'Аяна Сатыбалдиева', (current_date - interval '8 years')::date, 2,
   'Жылдыз Сатыбалдиева', '+996550998877', null, null, '10000000-0000-4000-8000-000000000002', now() - interval '5 days', now() - interval '21 days'),

  ('60000000-0000-4000-8000-000000000006', 'accepted', 'phone', 'Ислам Бакытов', (current_date - interval '11 years')::date, 5,
   'Бакыт Осмонов', '+996777112244', null, 'Интересует подготовка к олимпиадам.', '10000000-0000-4000-8000-000000000002', now() - interval '12 days', now() - interval '28 days'),

  ('60000000-0000-4000-8000-000000000007', 'enrolled', 'website', 'Мээрим Абдиева', (current_date - interval '11 years')::date, 5,
   'Айнура Абдиева', '+996700223344', null, null, '10000000-0000-4000-8000-000000000002', now() - interval '5 months', now() - interval '6 months'),

  ('60000000-0000-4000-8000-000000000008', 'rejected', 'walk_in', 'Тилек Мамбетов', (current_date - interval '16 years')::date, 11,
   'Мамбет Уулу', '+996555667788', null, null, '10000000-0000-4000-8000-000000000002', null, now() - interval '35 days');

update public.applications
   set rejection_reason = 'В 11 класс набора нет: школа ведёт 1–10 классы.'
 where id = '60000000-0000-4000-8000-000000000008';

-- Зачисленная заявка связана с личным делом — так CRM показывает «Открыть ученика».
update public.applications
   set student_id = '50000000-0000-4000-8000-000000000012'
 where id = '60000000-0000-4000-8000-000000000007';

update public.students
   set application_id = '60000000-0000-4000-8000-000000000007'
 where id = '50000000-0000-4000-8000-000000000012';

insert into public.application_events (application_id, type, body, from_status, to_status, author_id, created_at) values
  ('60000000-0000-4000-8000-000000000003', 'call', 'Позвонили, договорились подумать до конца недели.', null, null, '10000000-0000-4000-8000-000000000002', now() - interval '8 days'),
  ('60000000-0000-4000-8000-000000000003', 'status_change', null, 'new', 'contacted', '10000000-0000-4000-8000-000000000002', now() - interval '8 days'),
  ('60000000-0000-4000-8000-000000000004', 'trial_scheduled', 'Пробный день назначен, предупредили классного руководителя.', null, null, '10000000-0000-4000-8000-000000000002', now() - interval '6 days'),
  ('60000000-0000-4000-8000-000000000005', 'note', 'Ребёнку в классе комфортно, с математикой нужна поддержка первое время.', null, null, '10000000-0000-4000-8000-000000000003', now() - interval '5 days'),
  ('60000000-0000-4000-8000-000000000006', 'status_change', null, 'trial_done', 'accepted', '10000000-0000-4000-8000-000000000001', now() - interval '10 days'),
  ('60000000-0000-4000-8000-000000000007', 'status_change', null, 'accepted', 'enrolled', '10000000-0000-4000-8000-000000000002', now() - interval '5 months');

-- -----------------------------------------------------------------------------
-- 8. Расписание
-- -----------------------------------------------------------------------------

insert into public.lesson_slots (id, position, starts_at, ends_at) values
  ('70000000-0000-4000-8000-000000000001', 1, '08:30', '09:15'),
  ('70000000-0000-4000-8000-000000000002', 2, '09:25', '10:10'),
  ('70000000-0000-4000-8000-000000000003', 3, '10:30', '11:15'),
  ('70000000-0000-4000-8000-000000000004', 4, '11:25', '12:10'),
  ('70000000-0000-4000-8000-000000000005', 5, '12:40', '13:25'),
  ('70000000-0000-4000-8000-000000000006', 6, '13:35', '14:20');

-- Неделя уроков для 5А и 7А: два класса с полной сеткой достаточно, чтобы
-- журнал, замены и конфликты учителей было на чём проверить.
insert into public.schedule_entries (class_id, subject_id, teacher_id, weekday, lesson_slot_id, room)
values
  -- 5А
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000003', 'mon', '70000000-0000-4000-8000-000000000001', '204'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000101', '30000000-0000-4000-8000-000000000002', 'mon', '70000000-0000-4000-8000-000000000002', '301'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000104', '30000000-0000-4000-8000-000000000004', 'mon', '70000000-0000-4000-8000-000000000003', '105'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000101', '30000000-0000-4000-8000-000000000002', 'tue', '70000000-0000-4000-8000-000000000001', '301'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000003', 'tue', '70000000-0000-4000-8000-000000000002', '204'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000103', '30000000-0000-4000-8000-000000000005', 'tue', '70000000-0000-4000-8000-000000000003', '302'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000003', 'wed', '70000000-0000-4000-8000-000000000001', '204'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000107', '30000000-0000-4000-8000-000000000006', 'wed', '70000000-0000-4000-8000-000000000002', '106'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000101', '30000000-0000-4000-8000-000000000002', 'thu', '70000000-0000-4000-8000-000000000001', '301'),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000003', 'fri', '70000000-0000-4000-8000-000000000001', '204'),
  -- 7А
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000003', 'mon', '70000000-0000-4000-8000-000000000003', '204'),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000101', '30000000-0000-4000-8000-000000000002', 'mon', '70000000-0000-4000-8000-000000000004', '301'),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000003', 'tue', '70000000-0000-4000-8000-000000000004', '204'),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000106', '30000000-0000-4000-8000-000000000006', 'wed', '70000000-0000-4000-8000-000000000003', '106'),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000101', '30000000-0000-4000-8000-000000000002', 'thu', '70000000-0000-4000-8000-000000000004', '301'),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000003', 'fri', '70000000-0000-4000-8000-000000000004', '204');

-- -----------------------------------------------------------------------------
-- 9. Проведённые уроки за последние четыре недели
--
-- Даты берутся из самой сетки: для каждой записи расписания раскрываем все
-- подходящие дни. Так журнал всегда согласован с расписанием — урока, которого
-- нет в сетке, в журнале не появится.
-- -----------------------------------------------------------------------------

insert into public.lessons (schedule_entry_id, held_on, topic, homework)
select
  se.id,
  d::date,
  case s.code
    when 'math' then 'Разбор задач'
    when 'eng'  then 'Speaking practice'
    when 'ara'  then 'Чтение и письмо'
    else 'Тема урока'
  end,
  case when random() < 0.6 then 'Упражнения в рабочей тетради' else null end
from public.schedule_entries se
join public.subjects s on s.id = se.subject_id
cross join lateral generate_series(current_date - interval '28 days', current_date, interval '1 day') as d
where lower(to_char(d, 'dy')) = se.weekday::text
  and d::date <= current_date;

-- -----------------------------------------------------------------------------
-- 10. Посещаемость и оценки
--
-- Значения псевдослучайные, но привязаны к md5 от пары «ученик + урок»:
-- сид повторяем — картинка та же, и скриншоты вчерашнего дня совпадают
-- с сегодняшними.
-- -----------------------------------------------------------------------------

insert into public.attendance (lesson_id, student_id, status, marked_by)
select
  l.id,
  st.id,
  case (('x' || substr(md5(l.id::text || st.id::text), 1, 8))::bit(32)::bigint % 20)
    when 0 then 'absent'::public.attendance_status
    when 1 then 'late'::public.attendance_status
    when 2 then 'excused'::public.attendance_status
    else 'present'::public.attendance_status
  end,
  '10000000-0000-4000-8000-000000000003'
from public.lessons l
join public.schedule_entries se on se.id = l.schedule_entry_id
join public.students st on st.class_id = se.class_id and st.status = 'active';

-- Оценка стоит не на каждом уроке: примерно у трети учеников за занятие.
insert into public.grade_entries (lesson_id, student_id, subject_id, term_id, kind, value, marked_by)
select
  l.id,
  st.id,
  se.subject_id,
  t.id,
  'lesson'::public.grade_kind,
  3 + (('x' || substr(md5(st.id::text || l.id::text || 'g'), 1, 8))::bit(32)::bigint % 3),
  '10000000-0000-4000-8000-000000000003'
from public.lessons l
join public.schedule_entries se on se.id = l.schedule_entry_id
join public.students st on st.class_id = se.class_id and st.status = 'active'
join public.terms t on l.held_on between t.starts_on and t.ends_on
where (('x' || substr(md5(l.id::text || st.id::text || 'pick'), 1, 8))::bit(32)::bigint % 3) = 0;

-- Итоги четверти не заполняются вручную: триггер grade_entries_recalc_term
-- пересчитывает term_grades на каждую оценку. Так средний балл в табеле
-- не может разойтись с журналом — ни здесь, ни потом в работе школы.

-- -----------------------------------------------------------------------------
-- 11. Стоимость обучения, начисления и платежи
-- -----------------------------------------------------------------------------

insert into public.tuition_plans (id, academic_year_id, name, note, grade_from, grade_to, amount_kgs, period, is_public, sort_order) values
  ('80000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
   '{"ky":"Башталгыч мектеп","ru":"Начальная школа","en":"Primary school"}',
   '{"ky":"Үч маал тамак кирет","ru":"Включено трёхразовое питание","en":"Three meals a day included"}',
   1, 4, 12000, 'monthly', true, 1),
  ('80000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001',
   '{"ky":"Орто мектеп","ru":"Средняя школа","en":"Middle school"}',
   '{"ky":"Үч маал тамак жана ийримдер","ru":"Включено питание и секции","en":"Meals and clubs included"}',
   5, 9, 14000, 'monthly', true, 2),
  ('80000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001',
   '{"ky":"10-класс жана даярдык","ru":"10 класс и подготовка","en":"Grade 10 and exam prep"}',
   '{"ky":"ОРТ жана IELTS даярдыгы кирет","ru":"Включена подготовка к ОРТ и IELTS","en":"ORT and IELTS preparation included"}',
   10, 10, 16000, 'monthly', true, 3);

insert into public.student_tuition (student_id, tuition_plan_id, discount_percent, reason)
select
  s.id,
  case when c.grade_level <= 4 then '80000000-0000-4000-8000-000000000001'::uuid
       when c.grade_level <= 9 then '80000000-0000-4000-8000-000000000002'::uuid
       else '80000000-0000-4000-8000-000000000003'::uuid end,
  case when s.id = '50000000-0000-4000-8000-000000000007' then 20 else 0 end,
  case when s.id = '50000000-0000-4000-8000-000000000007' then 'Второй ребёнок в семье' else null end
from public.students s
join public.classes c on c.id = s.class_id
where s.status = 'active';

-- Начисления за три последних месяца: закрытые, частично оплаченные и открытые.
insert into public.invoices (id, student_id, number, period_start, period_end, amount_kgs, status, due_on)
select
  extensions.gen_random_uuid(),
  s.id,
  to_char(current_date - (m || ' months')::interval, 'YYYY-MM') || '-' || lpad((row_number() over (partition by m order by s.full_name))::text, 4, '0'),
  date_trunc('month', current_date - (m || ' months')::interval)::date,
  (date_trunc('month', current_date - (m || ' months')::interval) + interval '1 month' - interval '1 day')::date,
  case when c.grade_level <= 4 then 12000 when c.grade_level <= 9 then 14000 else 16000 end,
  case m when 2 then 'paid'::public.invoice_status
         when 1 then 'partially_paid'::public.invoice_status
         else 'open'::public.invoice_status end,
  (date_trunc('month', current_date - (m || ' months')::interval) + interval '9 days')::date
from public.students s
join public.classes c on c.id = s.class_id
cross join generate_series(0, 2) as m
where s.status = 'active';

-- Подтверждённые платежи по закрытым начислениям.
insert into public.payments (invoice_id, amount_kgs, method, status, confirmed_by, confirmed_at, submitted_by, paid_at)
select i.id, i.amount_kgs, 'bank_transfer', 'confirmed',
       '10000000-0000-4000-8000-000000000002', i.due_on::timestamptz,
       '10000000-0000-4000-8000-000000000004', i.due_on::timestamptz
from public.invoices i
where i.status = 'paid';

-- Половина суммы по частично оплаченным.
insert into public.payments (invoice_id, amount_kgs, method, status, confirmed_by, confirmed_at, submitted_by, paid_at)
select i.id, round(i.amount_kgs / 2, 2), 'qr', 'confirmed',
       '10000000-0000-4000-8000-000000000002', i.due_on::timestamptz,
       '10000000-0000-4000-8000-000000000004', i.due_on::timestamptz
from public.invoices i
where i.status = 'partially_paid';

-- И несколько чеков, ждущих бухгалтера, — ради экрана «Платежи на подтверждение».
insert into public.payments (invoice_id, amount_kgs, method, status, submitted_by, paid_at, note)
select i.id, i.amount_kgs, 'qr', 'pending',
       '10000000-0000-4000-8000-000000000004', now() - interval '1 day',
       'Оплатила через мобильный банк, чек приложила'
from public.invoices i
where i.status = 'open'
limit 4;

-- -----------------------------------------------------------------------------
-- 12. Объявления
-- -----------------------------------------------------------------------------

insert into public.announcements (title, body, audience, class_id, author_id, published_at) values
  ('Родительское собрание', 'В четверг в 18:00 в актовом зале. Разберём итоги четверти и планы на следующую.', 'parents', null, '10000000-0000-4000-8000-000000000001', now() - interval '2 days'),
  ('Семинар для родителей', 'Тема — домашние задания без ссор. Участие бесплатное, запись у классного руководителя.', 'parents', null, '10000000-0000-4000-8000-000000000001', now() - interval '9 days'),
  ('Педсовет', 'Понедельник, 15:00. Обсуждаем расписание на новую четверть.', 'staff', null, '10000000-0000-4000-8000-000000000001', now() - interval '4 days'),
  ('5А: выезд в музей', 'В пятницу выезжаем после третьего урока. Форма одежды свободная, обед берём с собой.', 'class', '40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', now() - interval '1 day');

-- -----------------------------------------------------------------------------
-- 13. Публичный сайт: контакты, цифры, новости, галерея
--
-- Как только появляется база, витрина перестаёт брать демонстрационный набор
-- из lib/content/demo.ts и показывает то, что здесь. Поэтому наполняем и её,
-- иначе после подключения Supabase сайт опустел бы.
--
-- Пути к фотографиям указывают в бакет media — файлы туда кладёт
-- scripts/seed-storage.mjs.
-- -----------------------------------------------------------------------------

insert into public.site_settings (key, value, is_public, description) values
  ('contacts.phone_primary', '"+996770277123"', true, 'Основной телефон'),
  ('contacts.phone_extra', '["+996555277123"]', true, 'Дополнительные телефоны'),
  ('contacts.email', '"info@danek.kg"', true, 'Почта приёмной'),
  ('contacts.address', '{"ky":"Бишкек шаары","ru":"город Бишкек","en":"Bishkek"}', true, 'Адрес'),
  ('contacts.work_hours', '{"ky":"Дүйшөмбү–жума 8:00–17:00, ишемби 9:00–13:00","ru":"Понедельник–пятница 8:00–17:00, суббота 9:00–13:00","en":"Monday–Friday 8:00–17:00, Saturday 9:00–13:00"}', true, 'Часы работы'),
  ('social.instagram', '"https://www.instagram.com/danek.uvk/"', true, 'Instagram'),
  ('social.whatsapp', '"https://chat.whatsapp.com/Ll0HdV0ng7I1bq7PDW0h78"', true, 'WhatsApp'),
  ('home.hero_image', '"site/hero-classroom.jpg"', true, 'Фото на обложке'),
  ('home.stats', '[
     {"value":"1–10","label":{"ky":"класстар","ru":"классы","en":"grades"}},
     {"value":"2","label":{"ky":"чет тили 1-класстан","ru":"иностранных языка с 1 класса","en":"foreign languages from grade 1"}},
     {"value":"3","label":{"ky":"маал тамактануу","ru":"разовое питание","en":"meals a day"}},
     {"value":"6.5+","label":{"ky":"IELTS максаты","ru":"цель по IELTS","en":"IELTS target"}}
   ]', true, 'Цифры на главной'),
  ('payment.bank_name', '"ОАО «Демир Банк»"', false, 'Банк-получатель'),
  ('payment.account', '"1234567890123456"', false, 'Расчётный счёт'),
  ('payment.recipient', '"УВК «ДАНЕК»"', false, 'Наименование получателя')
-- Часть ключей заводит миграция 0002 пустыми заготовками, чтобы страница
-- настроек в CRM не была пустым списком. Здесь мы их наполняем, а не дублируем.
on conflict (key) do update
  set value = excluded.value,
      is_public = excluded.is_public,
      description = excluded.description;

update public.teachers set photo_path = 'teachers/teacher-01.jpg' where slug = 'talantbek-sapitov';
update public.teachers set photo_path = 'teachers/teacher-02.jpg' where slug = 'aigerim-osmonova';
update public.teachers set photo_path = 'teachers/teacher-03.jpg' where slug = 'nurlan-abdyrahmanov';
update public.teachers set photo_path = 'teachers/teacher-04.jpg' where slug = 'zhyldyz-toktosunova';
update public.teachers set photo_path = 'teachers/teacher-05.jpg' where slug = 'azamat-kadyrov';
update public.teachers set photo_path = 'teachers/teacher-06.jpg' where slug = 'gulnara-asanova';

insert into public.news (slug, title, excerpt, body, cover_path, published_at, is_published, author_id) values
  ('respublikanskaya-olimpiada',
   '{"ky":"Республикалык олимпиадада — алтын, күмүш жана коло","ru":"Республиканская олимпиада: золото, серебро и бронза","en":"National olympiad: gold, silver and bronze"}',
   '{"ky":"Математика боюнча олимпиадада үч медаль.","ru":"Наши ученики привезли три медали с республиканской олимпиады по математике.","en":"Three medals from the national mathematics olympiad."}',
   '{"ky":"Математика боюнча республикалык олимпиада аяктады. ДАНЕК окуучулары алтын, күмүш жана коло медалдарга ээ болушту.\n\nОлимпиадага даярдык кадимки сабактын үстүнө курулат: 5-класстан баштап өзүнчө математика тобу иштейт.\n\n> Медаль — системанын жыйынтыгы, кокустук эмес. Биз бир баланы эмес, бүтүндөй агымды даярдайбыз.\n\nКийинки жылдан тандоо кеңейет: кошумча топко 4-класстан баштап кабыл алабыз.","ru":"Завершилась республиканская олимпиада по математике. Ученики ДАНЕК взяли золото, серебро и бронзу.\n\nПодготовка надстроена над обычным уроком: с пятого класса работает отдельная математическая группа, а те, кто выходит на призовые места, занимаются с преподавателем отдельно.\n\n> Медаль — результат системы, а не случайности. Мы готовим не одного ребёнка, а весь поток.\n\nСо следующего года отбор станет шире: в дополнительную группу будем брать уже с четвёртого класса.","en":"The national mathematics olympiad has ended, and DANEK students took gold, silver and bronze.\n\nPreparation is built on top of the regular lesson: an extra maths group runs from grade 5.\n\n> A medal is the result of a system, not of luck. We prepare a whole cohort, not a single child.\n\nFrom next year the selection widens: the extra group will take students from grade 4."}',
   'site/subject-math.jpg', now() - interval '12 days', true, '10000000-0000-4000-8000-000000000001'),

  ('priem-uchenikov',
   '{"ky":"1-класстан 10-класска чейин кабыл алуу ачык","ru":"Открыт приём учеников с 1 по 10 класс","en":"Admissions open for grades 1 to 10"}',
   '{"ky":"Жаңы окуу жылына жазылуу башталды.","ru":"Началась запись на новый учебный год. Мест ограниченное количество.","en":"Enrolment for the new school year is open."}',
   '{"ky":"Жаңы окуу жылына кабыл алуу башталды. Сайттан арыз калтырыңыз — жумуш күнү ичинде чалабыз жана жолугушууга убакыт белгилейбиз.\n\n> Бала болочок классында бир нече сынак күн өткөрөт — баа коюлбайт, басым жасалбайт.\n\nСынак күндөрдөн кийин чечимди эки тарап тең кабыл алат.","ru":"Открыт приём в 1–10 классы. Оставьте заявку на сайте — перезвоним в течение рабочего дня и договоримся о встрече. На встрече покажем школу и познакомим с учителями.\n\n> Затем ребёнок проводит несколько пробных дней в будущем классе — без оценок и без давления.\n\nПосле пробных дней решение принимают обе стороны: и семья, и школа.","en":"Admissions to grades 1–10 are open. Leave a request and we will call back within one working day to arrange a visit.\n\n> Then your child spends a few trial days in their future class — no grades, no pressure.\n\nAfter the trial days both sides decide: the family and the school."}',
   'site/hero-kids-walking.jpg', now() - interval '21 days', true, '10000000-0000-4000-8000-000000000002'),

  ('shkolnyy-turnir',
   '{"ky":"Мектеп ичиндеги футбол турнири","ru":"Школьный турнир по футболу","en":"School football tournament"}',
   '{"ky":"Жаңы аянтчада класстар аралык турнир.","ru":"На новом поле прошёл турнир между классами.","en":"An inter-class tournament on the new pitch."}',
   '{"ky":"Мектептин жаңы футбол аянтчасында класстар аралык турнир өттү. Беш класс катышты.","ru":"На новом футбольном поле прошёл турнир между классами. Участвовали пять команд, финал решился на последней минуте.","en":"Five teams played and the final was decided in the last minute."}',
   'site/life-football.jpg', now() - interval '40 days', true, '10000000-0000-4000-8000-000000000001'),

  ('seminar-dlya-roditeley',
   '{"ky":"Ата-энелер үчүн семинар","ru":"Семинар для родителей","en":"Seminar for parents"}',
   '{"ky":"Үй тапшырма боюнча талашты кантип токтотуу керек.","ru":"Как перестать воевать из-за домашнего задания.","en":"How to stop fighting over homework."}',
   '{"ky":"Мектепте ата-энелер үчүн семинар өттү. Семинарлар үзгүлтүксүз өткөрүлөт жана бекер.","ru":"В школе прошёл семинар для родителей. Семинары проходят регулярно и бесплатны для родителей учеников.","en":"The school held a seminar for parents. Seminars run regularly and are free."}',
   'site/parents-seminar.jpg', now() - interval '58 days', true, '10000000-0000-4000-8000-000000000001');

insert into public.gallery_albums (id, slug, title, description, cover_path, happened_on, is_published, sort_order) values
  ('90000000-0000-4000-8000-000000000001', 'shkolnye-budni',
   '{"ky":"Мектеп күндөрү","ru":"Школьные будни","en":"Everyday school life"}',
   '{"ky":"Кадимки сабактар.","ru":"Обычные уроки: чтение, письмо и работа в группах.","en":"Ordinary lessons."}',
   'site/classroom-wide.jpg', current_date - 8, true, 1),
  ('90000000-0000-4000-8000-000000000002', 'sport',
   '{"ky":"Спорт","ru":"Спорт","en":"Sport"}',
   '{"ky":"Футбол жана баскетбол.","ru":"Футбол, баскетбол и школьные турниры.","en":"Football and basketball."}',
   'site/life-football.jpg', current_date - 26, true, 2),
  ('90000000-0000-4000-8000-000000000003', 'kampus',
   '{"ky":"Кампус жана тамактануу","ru":"Кампус и питание","en":"Campus and meals"}',
   '{"ky":"Имарат, китепкана жана үч маал тамак.","ru":"Здание школы, библиотека и трёхразовое питание.","en":"The building, the library and three meals a day."}',
   'site/campus-building.jpg', current_date - 60, true, 3);

insert into public.gallery_photos (album_id, path, alt, sort_order) values
  ('90000000-0000-4000-8000-000000000001', 'site/classroom-wide.jpg', '{"ky":"Класстагы сабак","ru":"Урок в классе","en":"A lesson in class"}', 1),
  ('90000000-0000-4000-8000-000000000001', 'site/study-together.jpg',     '{"ky":"Биргелешип иштөө","ru":"Работа в группе","en":"Working in a group"}', 2),
  ('90000000-0000-4000-8000-000000000001', 'site/library-reading.jpg','{"ky":"Мугалим менен окуу","ru":"Чтение с учителем","en":"Reading with a teacher"}', 3),
  ('90000000-0000-4000-8000-000000000001', 'site/program-primary.jpg','{"ky":"Башталгыч класс","ru":"Начальная школа","en":"Primary school"}', 4),
  ('90000000-0000-4000-8000-000000000002', 'site/life-football.jpg',  '{"ky":"Футбол","ru":"Футбол","en":"Football"}', 1),
  ('90000000-0000-4000-8000-000000000002', 'site/life-basketball.jpg','{"ky":"Баскетбол","ru":"Баскетбол","en":"Basketball"}', 2),
  ('90000000-0000-4000-8000-000000000002', 'site/life-sport-track.jpg',     '{"ky":"Жеңил атлетика","ru":"Лёгкая атлетика","en":"Athletics"}', 3),
  ('90000000-0000-4000-8000-000000000003', 'site/campus-building.jpg','{"ky":"Мектеп имараты","ru":"Здание школы","en":"The school building"}', 1),
  ('90000000-0000-4000-8000-000000000003', 'site/campus-lawn.jpg',    '{"ky":"Мектеп короосу","ru":"Двор школы","en":"School grounds"}', 2),
  ('90000000-0000-4000-8000-000000000003', 'site/about-library.jpg',  '{"ky":"Китепкана","ru":"Библиотека","en":"The library"}', 3),
  ('90000000-0000-4000-8000-000000000003', 'site/life-meals.jpg',     '{"ky":"Мектеп ашканасы","ru":"Школьное питание","en":"School meals"}', 4);
