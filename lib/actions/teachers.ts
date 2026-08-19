"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Публикация на сайте — единственное операционное действие, которое нужно чаще всего. */
export async function setTeacherVisibility(
  locale: string,
  teacherId: string,
  isPublic: boolean,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("teachers")
    .update({ is_public: isPublic })
    .eq("id", teacherId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/teachers`);
  revalidatePath(`/${locale}/teachers`);
  return { ok: true };
}
