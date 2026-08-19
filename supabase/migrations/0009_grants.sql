-- =============================================================================
-- Права на таблицы для ролей anon и authenticated.
--
-- Их не хватало: миграции 0001–0008 включают RLS и описывают политики, но
-- ни одной привилегии на сами таблицы не выдают. А это два независимых
-- механизма, и работают они последовательно: сначала Postgres проверяет
-- GRANT, и только потом RLS отбирает строки. Без GRANT запрос не доходит до
-- политики вовсе — PostgREST отвечает «permission denied for table students».
--
-- Наружу это выглядело так: витрина показывала пустые разделы, а в CRM все
-- счётчики стояли на нуле — при полной и правильно заполненной базе.
--
-- Права выдаём широко, а доступ ограничиваем политиками. Так устроен сам
-- Supabase: сузить GRANT до отдельных таблиц значит завести вторую систему
-- разграничения рядом с RLS и однажды забыть обновить одну из них.
-- =============================================================================

grant usage on schema public to anon, authenticated;

-- Чтение. Аноним видит только то, что политики пометили публичным:
-- опубликованные новости, альбомы, педагогов с is_public и настройки сайта.
grant select on all tables in schema public to anon, authenticated;

-- Запись — только вошедшим. Кто именно и какие строки может менять, решают
-- политики: родитель не тронет чужого ребёнка, учитель — чужой класс.
grant insert, update, delete on all tables in schema public to authenticated;

-- Анониму нужна ровно одна запись: заявка с сайта. Отдельной строкой, потому
-- что общий grant на запись ему давать нельзя.
grant insert on public.applications to anon;

-- Последовательности: без них insert в таблицы с bigserial (audit_log)
-- падает на nextval, даже когда сам insert разрешён.
grant usage, select on all sequences in schema public to anon, authenticated;

-- Таблицы, которые появятся в следующих миграциях, должны получать те же
-- права автоматически — иначе эта миграция станет ловушкой для будущего
-- разработчика, который добавит таблицу и не поймёт, почему она не читается.
alter default privileges in schema public
  grant select on tables to anon, authenticated;

alter default privileges in schema public
  grant insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;
