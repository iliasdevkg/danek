"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Массовое сохранение настроек — upsert по ключу.
 *
 * Один клик «Сохранить» обновляет все изменённые поля разом, а не по одному
 * запросу на поле: на слабом интернете форма из 15 полей не должна превращаться
 * в 15 отдельных round-trip.
 */
export async function saveSiteSettings(
  locale: string,
  entries: { key: string; value: Json }[],
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("site_settings").upsert(
    entries.map(({ key, value }) => ({ key, value, updated_by: user?.id ?? null })),
    { onConflict: "key" },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/${locale}/crm/settings`);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/contacts`);
  return { ok: true };
}
