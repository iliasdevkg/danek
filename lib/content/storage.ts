import { SUPABASE_URL } from "@/lib/supabase/env";

export const MEDIA_BUCKET = "media";

/**
 * Путь в бакете → публичный URL.
 *
 * В базе хранится именно путь, а не готовая ссылка: смена проекта Supabase или
 * домена не превращает все фото школы в битые картинки.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path || !SUPABASE_URL) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const clean = path.replace(/^\/+/, "");
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${clean}`;
}
