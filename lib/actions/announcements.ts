"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import type { AnnouncementAudience } from "@/lib/supabase/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createAnnouncement(
  locale: string,
  input: { title: string; body: string; audience: AnnouncementAudience; classId: string | null },
): Promise<ActionResult> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 2 || body.length < 2) return { ok: false, error: "invalid" };
  if (input.audience === "class" && !input.classId) return { ok: false, error: "class_required" };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("announcements").insert({
    title,
    body,
    audience: input.audience,
    class_id: input.audience === "class" ? input.classId : null,
    author_id: user?.id ?? null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/announcements`);
  revalidatePath(`/${locale}/parent`);
  revalidatePath(`/${locale}/student`);
  return { ok: true };
}
