-- =============================================================================
-- ДАНЕК · 0001 · Фундамент: роли, профили, аудит, настройки сайта
-- =============================================================================
-- Принципы, которые действуют во всех последующих миграциях:
--   1. RLS включена на каждой таблице без исключений.
--   2. Роль читается из JWT (быстрый путь), а не подзапросом на каждую строку.
--   3. auth.uid() всегда завёрнут в (select auth.uid()) — Postgres вычисляет его
--      один раз на запрос, а не на каждую строку. На таблице в 100k строк это
--      разница между 8 мс и 900 мс.
--   4. У каждой SECURITY DEFINER функции пустой search_path — защита от подмены.
-- =============================================================================

create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "citext" with schema extensions;

-- -----------------------------------------------------------------------------
-- Роли
-- -----------------------------------------------------------------------------

create type public.app_role as enum (
  'admin',    -- директор: видит и меняет всё
  'manager',  -- приёмная комиссия и бухгалтерия
  'teacher',  -- только свои классы
  'parent',   -- только свои дети
  'student'   -- только себя
);

create type public.locale_code as enum ('ky', 'ru', 'en');

-- -----------------------------------------------------------------------------
-- Профили
-- -----------------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          public.app_role not null default 'parent',
  full_name     text not null default '',
  phone         text,
  email         extensions.citext,
  avatar_url    text,
  locale        public.locale_code not null default 'ru',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint profiles_full_name_len check (char_length(full_name) <= 160),
  -- Кыргызстан: +996 и 9 цифр. Формат нормализуется приложением до записи.
  constraint profiles_phone_format check (phone is null or phone ~ '^\+996[0-9]{9}$')
);

comment on table public.profiles is
  'Профиль пользователя. Один к одному с auth.users, хранит роль и контакты.';

create index profiles_role_idx on public.profiles (role) where is_active;
create index profiles_phone_idx on public.profiles (phone) where phone is not null;

-- -----------------------------------------------------------------------------
-- Общие триггеры
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Новый пользователь Supabase Auth → профиль. Роль и имя берём из метаданных
-- приглашения; по умолчанию родитель — самая безопасная роль.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta_role public.app_role;
begin
  begin
    meta_role := (new.raw_app_meta_data ->> 'role')::public.app_role;
  exception when others then
    meta_role := null;
  end;

  insert into public.profiles (id, role, full_name, email, phone, locale)
  values (
    new.id,
    coalesce(meta_role, 'parent'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce((new.raw_user_meta_data ->> 'locale')::public.locale_code, 'ru')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Роль в JWT: hook + хелперы доступа
-- -----------------------------------------------------------------------------

-- Supabase Auth вызывает этот hook при выпуске токена и кладёт роль в claims.
-- Благодаря этому политики RLS не ходят в таблицу profiles на каждой проверке.
-- Включается в панели: Authentication → Hooks → Custom Access Token.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims    jsonb;
  user_role public.app_role;
begin
  select p.role into user_role
  from public.profiles p
  where p.id = (event ->> 'user_id')::uuid;

  claims := coalesce(event -> 'claims', '{}'::jsonb);

  if claims -> 'app_metadata' is null then
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  end if;

  claims := jsonb_set(
    claims,
    '{app_metadata,role}',
    case when user_role is null then 'null'::jsonb else to_jsonb(user_role::text) end
  );

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
grant select on public.profiles to supabase_auth_admin;

-- Роль текущего пользователя. Быстрый путь — claim из JWT. Откат в profiles
-- нужен для первого входа до включения hook и для служебных подключений.
create or replace function public.auth_role()
returns public.app_role
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claim  text;
  result public.app_role;
begin
  claim := auth.jwt() -> 'app_metadata' ->> 'role';

  if claim is not null and claim <> '' and claim <> 'null' then
    return claim::public.app_role;
  end if;

  select p.role into result
  from public.profiles p
  where p.id = (select auth.uid());

  return result;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.auth_role() = 'admin';
$$;

-- Сотрудник школы: админ, менеджер приёмной или учитель.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.auth_role() in ('admin', 'manager', 'teacher');
$$;

-- Полный доступ к операционным данным: всё, кроме учителя.
create or replace function public.is_office()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.auth_role() in ('admin', 'manager');
$$;

grant execute on function public.auth_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_office() to authenticated;

-- Никто, кроме админа, не может поднять себе роль — даже обновляя свой профиль.
--
-- Исключение — auth.uid() is null: так выглядит вызов без JWT конечного
-- пользователя, то есть service_role-скрипт или SQL Editor в панели Supabase.
-- Без этого исключения назначить самого первого администратора школы было бы
-- невозможно в принципе — сработал бы тот же запрет, что и для чужого запроса,
-- потому что is_admin() у ещё несуществующего админа тоже вернёт false.
-- Настоящего конечного пользователя (обычный вход в CRM) это не ослабляет:
-- у него auth.uid() всегда заполнен.
create or replace function public.guard_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'Изменить роль может только администратор'
      using errcode = '42501';
  end if;

  if new.id is distinct from old.id then
    raise exception 'Идентификатор профиля неизменяем'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger profiles_guard_changes
  before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- -----------------------------------------------------------------------------
-- RLS: профили
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- Учителю нужны контакты родителей своих учеников, менеджеру — всех.
create policy "profiles_select_staff"
  on public.profiles for select
  to authenticated
  using (public.is_staff());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles_update_office"
  on public.profiles for update
  to authenticated
  using (public.is_office())
  with check (public.is_office());

create policy "profiles_insert_office"
  on public.profiles for insert
  to authenticated
  with check (public.is_office());

create policy "profiles_delete_admin"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Настройки сайта
-- -----------------------------------------------------------------------------

create table public.site_settings (
  key         text primary key,
  value       jsonb not null,
  is_public   boolean not null default false,
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles (id) on delete set null
);

comment on table public.site_settings is
  'Телефоны, адрес, соцсети, банковские реквизиты. Правятся в CRM без выката кода.';

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "site_settings_select_public"
  on public.site_settings for select
  to anon, authenticated
  using (is_public);

create policy "site_settings_select_staff"
  on public.site_settings for select
  to authenticated
  using (public.is_staff());

create policy "site_settings_select_parent_payment"
  on public.site_settings for select
  to authenticated
  using (public.auth_role() = 'parent' and key like 'payment.%');

create policy "site_settings_all_office"
  on public.site_settings for all
  to authenticated
  using (public.is_office())
  with check (public.is_office());

-- -----------------------------------------------------------------------------
-- Аудит
-- -----------------------------------------------------------------------------

create table public.audit_log (
  id         bigserial primary key,
  actor_id   uuid references public.profiles (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  diff       jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_log is
  'Кто, что и когда изменил. Пишется приложением, читается только админом.';

create index audit_log_entity_idx on public.audit_log (entity, entity_id, created_at desc);
create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc);

alter table public.audit_log enable row level security;

create policy "audit_log_select_admin"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

-- Запись — только через service role (серверный код), никогда из браузера.

-- -----------------------------------------------------------------------------
-- Базовые настройки сайта
-- -----------------------------------------------------------------------------

-- Реальные значения — instagram и whatsapp — подтверждены со страницы @danek.uvk.
-- Телефон, почта, адрес и точная карта не подтверждены: пустая строка честнее
-- выдуманного номера, на который родитель случайно позвонит. Школа заполнит
-- их сама в CRM (Настройки), когда будут под рукой.
insert into public.site_settings (key, value, is_public, description) values
  ('contacts.phone_primary',  '""',                          true,  'Основной телефон приёмной'),
  ('contacts.phone_extra',    '[]',                          true,  'Дополнительные телефоны'),
  ('contacts.email',          '""',                          true,  'Почта для родителей'),
  ('contacts.address',        '{"ky":"","ru":"","en":""}',  true,  'Адрес школы на трёх языках'),
  ('contacts.map',            'null',                        true,  'Точка на карте'),
  ('contacts.work_hours',     '{"ky":"","ru":"","en":""}',  true,  'Часы работы приёмной'),
  ('social.instagram',        '"https://www.instagram.com/danek.uvk/"', true, 'Instagram школы'),
  ('social.facebook',         '""',                          true,  'Facebook школы'),
  ('social.whatsapp',         '"https://chat.whatsapp.com/Ll0HdV0ng7I1bq7PDW0h78"', true, 'Ссылка на WhatsApp-группу для родителей'),
  ('social.telegram',         '""',                          true,  'Telegram школы'),
  ('home.hero_image',         '""',                          true,  'Путь к обложке главной в бакете media'),
  ('home.stats',              '[]',                          true,  'Цифры на главной: [{"value":"12","label":{"ky":"","ru":"","en":""}}]'),
  ('payment.bank_name',       '""',                          false, 'Банк-получатель'),
  ('payment.account',         '""',                          false, 'Расчётный счёт'),
  ('payment.recipient',       '""',                          false, 'Наименование получателя'),
  ('payment.qr_payload',      '""',                          false, 'Строка для генерации QR оплаты')
on conflict (key) do nothing;
