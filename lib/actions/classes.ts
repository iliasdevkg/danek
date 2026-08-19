"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type CreateClassInput = {
  academicYearId: string;
  gradeLevel: number;
  letter: string;
  homeroomTeacherId: string | null;
  capacity: number;
};

export async function createClass(locale: string, input: CreateClassInput): Promise<ActionResult> {
  const letter = input.letter.trim().toUpperCase();
  if (!letter || input.gradeLevel < 1 || input.gradeLevel > 11) {
    return { ok: false, error: "invalid" };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("classes").insert({
    academic_year_id: input.academicYearId,
    grade_level: input.gradeLevel,
    letter,
    homeroom_teacher_id: input.homeroomTeacherId,
    capacity: input.capacity,
  });

  if (error) {
    // Уникальный индекс (год, класс, литера) — понятная причина вместо кода Postgres.
    if (error.code === "23505") return { ok: false, error: "duplicate" };
    return { ok: false, error: error.message };
  }

  revalidatePath(`/${locale}/crm/classes`);
  return { ok: true };
}

export async function updateClassHomeroom(
  locale: string,
  classId: string,
  teacherId: string | null,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("classes")
    .update({ homeroom_teacher_id: teacherId })
    .eq("id", classId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/classes`);
  revalidatePath(`/${locale}/crm/classes/${classId}`);
  return { ok: true };
}
