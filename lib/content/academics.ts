import { demoSubjects, isDemoContent } from "@/lib/content/demo";
import { pickI18n } from "@/lib/content/i18n-value";
import type { Locale } from "@/lib/i18n/config";
import { getPublicSupabase } from "@/lib/supabase/public";
import type { I18nText, TuitionPeriod } from "@/lib/supabase/database.types";

export type SubjectItem = { id: string; name: string; color: string };

export type TuitionRow = {
  id: string;
  name: string;
  note: string;
  gradeFrom: number;
  gradeTo: number;
  amount: number;
  period: TuitionPeriod;
};

export async function getSubjects(locale: Locale): Promise<SubjectItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return isDemoContent ? demoSubjects(locale) : [];

  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, color")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("[subjects] не удалось прочитать предметы:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: pickI18n(row.name as I18nText, locale),
    color: row.color,
  }));
}

/**
 * Тарифы текущего учебного года.
 *
 * Год определяется флагом is_current, а не датой: школа сама решает, когда
 * переключить сайт на новый прайс — обычно раньше 1 сентября.
 */
export async function getPublicTuition(locale: Locale): Promise<TuitionRow[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("tuition_plans")
    .select(
      "id, name, note, grade_from, grade_to, amount_kgs, period, academic_years!inner(is_current)",
    )
    .eq("is_public", true)
    .eq("academic_years.is_current", true)
    .order("sort_order", { ascending: true })
    .order("grade_from", { ascending: true });

  if (error || !data) {
    console.error("[tuition] не удалось прочитать тарифы:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: pickI18n(row.name as I18nText, locale),
    note: pickI18n(row.note as I18nText, locale),
    gradeFrom: row.grade_from,
    gradeTo: row.grade_to,
    amount: Number(row.amount_kgs),
    period: row.period,
  }));
}
