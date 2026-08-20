"use server";

import { assertOffice, ForbiddenError } from "@/lib/actions/guard";
import { revalidateSiteShell } from "@/lib/content/revalidate";
import {
  isSiteSettingKey,
  SITE_SETTINGS,
  type SiteSettingKey,
} from "@/lib/content/site-settings-schema";
import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Json } from "@/lib/supabase/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Массовое сохранение настроек — upsert по ключу.
 *
 * Один клик «Сохранить» обновляет все изменённые поля разом, а не по одному
 * запросу на поле: на слабом интернете форма из 15 полей не должна превращаться
 * в 15 отдельных round-trip.
 *
 * Флаг видимости приходит из реестра `site-settings-schema.ts`, а не
 * подставляется одинаковым. Раньше его не было вовсе: колонка `is_public`
 * по умолчанию `false`, публичное чтение идёт под `using (is_public)`, и любой
 * ключ, которого нет среди засеянных, сохранялся успешно и не появлялся на
 * сайте — без ошибки и без следа. Дописать всем `true` тоже нельзя: тогда
 * в открытый доступ уедут расчётный счёт и строка для QR оплаты.
 */
export async function saveSiteSettings(
  locale: string,
  entries: { key: string; value: Json }[],
): Promise<ActionResult> {
  try {
    await assertOffice();
  } catch (error) {
    if (error instanceof ForbiddenError) return { ok: false, error: "forbidden" };
    throw error;
  }

  // Ключ, которого нет в реестре, не попадёт в таблицу даже если форму
  // подменили в браузере: писать в site_settings произвольные строки нельзя.
  const unknown = entries.find((entry) => !isSiteSettingKey(entry.key));
  if (unknown) return { ok: false, error: `unknown_setting:${unknown.key}` };

  const known = entries as { key: SiteSettingKey; value: Json }[];

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("site_settings").upsert(
    known.map(({ key, value }) => ({
      key,
      value,
      is_public: SITE_SETTINGS[key].public,
      updated_by: user?.id ?? null,
    })),
    { onConflict: "key" },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/${locale}/crm/settings`);

  // Контакты, соцсети и цифры читает макет витрины, а не отдельная страница,
  // поэтому сбрасывать нужно его — и на всех трёх языках сразу.
  if (known.some(({ key }) => SITE_SETTINGS[key].affectsSite)) {
    revalidateSiteShell();
  }

  return { ok: true };
}
