import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type SettingsMap = Record<string, Json>;

/** Все настройки сайта одним запросом — их всего два десятка строк. */
export async function getAllSiteSettings(): Promise<SettingsMap> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("site_settings").select("key, value");

  if (error) {
    console.error("[crm] не удалось прочитать настройки:", error.message);
    return {};
  }

  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}
