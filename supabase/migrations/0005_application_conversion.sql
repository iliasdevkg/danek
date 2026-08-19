-- =============================================================================
-- ДАНЕК · 0005 · Конвертация заявки в ученика
-- =============================================================================
-- Отдельная миграция, а не правка 0002/0004: функция опирается на обе таблицы
-- (applications и students), и должна применяться после того, как обе существуют.

-- Одна атомарная операция вместо «вставить ученика, потом обновить заявку»
-- из двух отдельных запросов клиента — если второй шаг упадёт, заявка не
-- зависнет со статусом «в процессе» без связанного ученика.
create or replace function public.convert_application_to_student(
  p_application_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_app     public.applications;
  v_student_id uuid;
begin
  if not public.is_office() then
    raise exception 'Зачисление доступно только офису' using errcode = '42501';
  end if;

  select * into v_app from public.applications where id = p_application_id for update;

  if v_app is null then
    raise exception 'Заявка не найдена' using errcode = 'P0002';
  end if;

  if v_app.student_id is not null then
    -- Идемпотентность: повторный клик «Зачислить» не создаёт вторую копию ученика.
    return v_app.student_id;
  end if;

  insert into public.students (full_name, birth_date, application_id, enrolled_on)
  values (v_app.child_name, v_app.child_birth_date, v_app.id, current_date)
  returning id into v_student_id;

  update public.applications
    set status = 'enrolled', student_id = v_student_id
    where id = p_application_id;

  return v_student_id;
end;
$$;

comment on function public.convert_application_to_student(uuid) is
  'security invoker: выполняется от имени вызывающего сотрудника, поэтому RLS
   таблиц applications/students продолжает действовать внутри функции — офис
   не получает через неё прав больше, чем у него уже есть напрямую.';

grant execute on function public.convert_application_to_student(uuid) to authenticated;
