"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import type { AttendanceStatus, GradeKind } from "@/lib/supabase/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Урок «открывается» лениво: учитель заходит в журнал — строка появляется сама. */
export async function openLesson(scheduleEntryId: string, heldOn: string): Promise<string | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("open_lesson", {
    p_schedule_entry_id: scheduleEntryId,
    p_held_on: heldOn,
  });

  if (error) {
    console.error("[journal] не удалось открыть урок:", error.message);
    return null;
  }
  return data;
}

export async function updateLessonDetails(
  locale: string,
  lessonId: string,
  topic: string,
  homework: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("lessons")
    .update({ topic: topic || null, homework: homework || null })
    .eq("id", lessonId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/journal`);
  return { ok: true };
}

export async function markAttendance(
  locale: string,
  lessonId: string,
  studentId: string,
  status: AttendanceStatus,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("attendance")
    .upsert(
      { lesson_id: lessonId, student_id: studentId, status, marked_by: user?.id ?? null },
      { onConflict: "lesson_id,student_id" },
    );

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/journal`);
  return { ok: true };
}

export async function addGrade(
  locale: string,
  input: {
    lessonId: string | null;
    studentId: string;
    subjectId: string;
    termId: string;
    kind: GradeKind;
    value: number;
  },
): Promise<ActionResult> {
  if (input.value < 2 || input.value > 5) return { ok: false, error: "invalid_value" };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("grade_entries").insert({
    lesson_id: input.lessonId,
    student_id: input.studentId,
    subject_id: input.subjectId,
    term_id: input.termId,
    kind: input.kind,
    value: input.value,
    marked_by: user?.id ?? null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/journal`);
  return { ok: true };
}

export async function deleteGrade(locale: string, gradeId: string): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("grade_entries").delete().eq("id", gradeId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/journal`);
  return { ok: true };
}
