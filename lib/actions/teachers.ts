"use server";

import { revalidatePath } from "next/cache";

import { assertOffice, ForbiddenError } from "@/lib/actions/guard";
import { revalidateSitePath } from "@/lib/content/revalidate";
import { createServerSupabase } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Публикация на сайте — единственное операционное действие, которое нужно чаще всего. */
export async function setTeacherVisibility(
  locale: string,
  teacherId: string,
  isPublic: boolean,
): Promise<ActionResult> {
  try {
    await assertOffice();
  } catch (error) {
    if (error instanceof ForbiddenError) return { ok: false, error: "forbidden" };
    throw error;
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("teachers")
    .update({ is_public: isPublic })
    .eq("id", teacherId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/${locale}/crm/teachers`);

  /*
   * Карточка педагога одна, а страниц с ней три — по числу языков. Раньше
   * сбрасывался только язык администратора: русский видел нового педагога
   * сразу, кыргызская и английская версии — через час.
   *
   * Главная тоже показывает четверых педагогов, поэтому её сбрасываем следом.
   */
  revalidateSitePath("teachers");
  revalidateSitePath("");

  return { ok: true };
}
