import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let cached: SupabaseClient<Database> | null = null;

/**
 * Клиент для публичного сайта: анонимный, без сессии и без обращения к cookies.
 *
 * Это принципиально. Любое чтение cookies() переводит страницу в динамический
 * рендер, и вместо раздачи с CDN школа получает вызов функции на каждый визит.
 * Витрина обязана оставаться статикой, поэтому здесь отдельный клиент.
 *
 * Возвращает null, когда Supabase не сконфигурирован — вызывающий код показывает
 * пустое состояние, а не роняет всю страницу.
 */
export function getPublicSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;

  cached ??= createClient<Database>(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "danek-site" } },
  });

  return cached;
}
