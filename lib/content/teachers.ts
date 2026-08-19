import { demoTeachers, isDemoContent } from "@/lib/content/demo";
import { pickI18n } from "@/lib/content/i18n-value";
import type { ImageSource } from "@/lib/content/stock-images";
import { mediaUrl } from "@/lib/content/storage";
import type { Locale } from "@/lib/i18n/config";
import { getPublicSupabase } from "@/lib/supabase/public";
import type { I18nText } from "@/lib/supabase/database.types";

export type TeacherCard = {
  id: string;
  slug: string;
  fullName: string;
  position: string;
  bio: string;
  /** Строка — снимок из Storage, объект — локальный демонстрационный портрет. */
  photoUrl: ImageSource | null;
  subjects: string[];
  yearsTeaching: number | null;
};

type TeacherRow = {
  id: string;
  slug: string;
  full_name: string;
  position: I18nText;
  bio: I18nText;
  photo_path: string | null;
  teaching_since: string | null;
  teacher_subjects: { subjects: { name: I18nText } | null }[] | null;
};

function toCard(row: TeacherRow, locale: Locale): TeacherCard {
  const since = row.teaching_since ? new Date(row.teaching_since) : null;

  return {
    id: row.id,
    slug: row.slug,
    fullName: row.full_name,
    position: pickI18n(row.position, locale),
    bio: pickI18n(row.bio, locale),
    photoUrl: mediaUrl(row.photo_path),
    subjects: (row.teacher_subjects ?? [])
      .map((link) => pickI18n(link.subjects?.name, locale))
      .filter(Boolean),
    yearsTeaching:
      since && !Number.isNaN(since.getTime())
        ? Math.max(0, new Date().getFullYear() - since.getFullYear())
        : null,
  };
}

/**
 * Опубликованные педагоги для сайта.
 *
 * Порядок задаёт школа полем sort_order — директор и завучи идут первыми,
 * а не в алфавитном порядке базы.
 */
export async function getPublicTeachers(locale: Locale, limit?: number): Promise<TeacherCard[]> {
  const supabase = getPublicSupabase();
  // Без базы витрину наполняет демонстрационный набор — см. lib/content/demo.ts.
  if (!supabase) return isDemoContent ? demoTeachers(locale, limit) : [];

  let query = supabase
    .from("teachers")
    .select(
      "id, slug, full_name, position, bio, photo_path, teaching_since, teacher_subjects(subjects(name))",
    )
    .eq("is_public", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("full_name", { ascending: true });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error || !data) {
    console.error("[teachers] не удалось прочитать педагогов:", error?.message);
    return [];
  }

  return (data as unknown as TeacherRow[]).map((row) => toCard(row, locale));
}
