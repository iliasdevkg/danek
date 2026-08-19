"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL, assertSupabaseConfigured } from "./env";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Браузерный клиент — один экземпляр на вкладку, иначе плодятся подписки realtime. */
export function createBrowserSupabase() {
  assertSupabaseConfigured();
  cached ??= createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
  return cached;
}
