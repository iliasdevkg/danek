/**
 * Ключи Supabase. Поддерживаются оба поколения имён: новые publishable-ключи
 * и легаси anon — чтобы обновление проекта Supabase не требовало правок кода.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY);

/**
 * Бросает понятную ошибку вместо `undefined is not a valid URL` где-то в недрах
 * библиотеки. Вызывается только там, где без подключения работать нельзя —
 * публичные страницы вместо падения показывают пустое состояние.
 */
export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Не заданы NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
        "Скопируйте .env.example в .env.local и заполните значениями из панели Supabase.",
    );
  }
}
