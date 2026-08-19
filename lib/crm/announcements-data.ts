import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type { AnnouncementAudience } from "@/lib/supabase/database.types";

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  className: string | null;
  authorName: string | null;
  publishedAt: string;
};

export async function getAnnouncements(limit?: number): Promise<AnnouncementItem[]> {
  const supabase = await createServerSupabase();

  let query = supabase
    .from("announcements")
    .select(
      "id, title, body, audience, published_at, classes(grade_level, letter), profiles(full_name)",
    )
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("[crm] не удалось прочитать объявления:", error.message);
    return [];
  }

  return (
    data as unknown as {
      id: string;
      title: string;
      body: string;
      audience: AnnouncementAudience;
      published_at: string;
      classes: { grade_level: number; letter: string } | null;
      profiles: { full_name: string } | null;
    }[]
  ).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    audience: row.audience,
    className: row.classes ? `${row.classes.grade_level}${row.classes.letter}` : null,
    authorName: row.profiles?.full_name ?? null,
    publishedAt: row.published_at,
  }));
}
