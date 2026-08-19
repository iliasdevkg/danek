-- =============================================================================
-- ДАНЕК · 0003 · Хранилище файлов
-- =============================================================================

-- Бакет публичный: фото педагогов, обложки новостей и галерея раздаются с CDN
-- Supabase и оптимизируются next/image. Приватные документы учеников поедут
-- в отдельный закрытый бакет вместе с миграцией личных дел.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 МБ: больше для веб-фото не нужно, а случайный RAW не пройдёт
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "media_select_all"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media_insert_office"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_office());

create policy "media_update_office"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_office())
  with check (bucket_id = 'media' and public.is_office());

create policy "media_delete_office"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_office());
