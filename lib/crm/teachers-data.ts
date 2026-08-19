import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import { pickI18n } from "@/lib/content/i18n-value";
import type { Locale } from "@/lib/i18n/config";
import type { I18nText } from "@/lib/supabase/database.types";

export type CrmTeacherRow = {
  id: string;
  fullName: string;
  position: string;
  subjects: string[];
  isPublic: boolean;
  isActive: boolean;
};

type Row = {
  id: string;
  full_name: string;
  position: I18nText;
  is_public: boolean;
  is_active: boolean;
  teacher_subjects: { subjects: { name: I18nText } | null }[] | null;
};

/** Все педагоги для CRM — публичные и ещё не опубликованные на сайте. */
export async function getCrmTeachers(locale: Locale): Promise<CrmTeacherRow[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("teachers")
    .select("id, full_name, position, is_public, is_active, teacher_subjects(subjects(name))")
    .order("sort_order")
    .order("full_name");

  if (error) {
    console.error("[crm] не удалось прочитать педагогов:", error.message);
    return [];
  }

  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    position: pickI18n(row.position, locale),
    subjects: (row.teacher_subjects ?? [])
      .map((s) => pickI18n(s.subjects?.name, locale))
      .filter(Boolean),
    isPublic: row.is_public,
    isActive: row.is_active,
  }));
}
