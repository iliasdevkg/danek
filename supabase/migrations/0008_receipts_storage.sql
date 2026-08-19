-- =============================================================================
-- ДАНЕК · 0008 · Приватное хранилище чеков оплаты
-- =============================================================================
-- Отдельный бакет от 0003: чек об оплате — не публичная фотография школы,
-- его обязаны видеть только сама семья и бухгалтерия.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Путь в бакете — всегда "<student_id>/<uuid>.<ext>", это и есть проверка доступа:
-- случайный authenticated не подставит чужой student_id, потому что не пройдёт
-- guardian_of() ниже, а офис получает доступ отдельной политикой.
create policy "receipts_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'receipts'
    and (public.is_office() or public.guardian_of((storage.foldername(name))[1]::uuid))
  );

create policy "receipts_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'receipts'
    and (public.is_office() or public.guardian_of((storage.foldername(name))[1]::uuid))
  );

create policy "receipts_delete_office"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'receipts' and public.is_office());
