import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { SUPABASE_URL, isSupabaseConfigured } from "./env";

let cached: SupabaseClient<Database> | null = null;

/**
 * Клиент с service_role: обходит RLS полностью.
 *
 * Допустим только в серверных действиях и обработчиках маршрутов, где право
 * уже проверено вручную. Никогда не импортируется в клиентский компонент —
 * за этим следит "server-only" сверху файла.
 */
export function createAdminSupabase(): SupabaseClient<Database> {
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!isSupabaseConfigured || !serviceKey) {
    throw new Error(
      "Не задан SUPABASE_SECRET_KEY. Служебный ключ берётся в панели Supabase: " +
        "Settings → API Keys. Он не должен попадать в переменные с префиксом NEXT_PUBLIC_.",
    );
  }

  cached ??= createClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "danek-admin" } },
  });

  return cached;
}
