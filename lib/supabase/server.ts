import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL, assertSupabaseConfigured } from "./env";

/**
 * Серверный клиент с сессией пользователя — для CRM и кабинетов.
 * Читает cookies, поэтому маршрут становится динамическим: это ровно то,
 * что нужно за логином, и ровно то, чего нельзя допускать на витрине.
 */
export async function createServerSupabase() {
  assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component не может писать cookies. Сессию продлевает proxy.ts —
          // здесь молчаливый пропуск корректен, а не проглоченная ошибка.
        }
      },
    },
  });
}
