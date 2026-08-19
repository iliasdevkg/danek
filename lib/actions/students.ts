"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import type { StudentStatus } from "@/lib/supabase/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type CreateStudentInput = {
  fullName: string;
  birthDate: string | null;
  classId: string | null;
};

export async function createStudent(
  locale: string,
  input: CreateStudentInput,
): Promise<ActionResult & { id?: string }> {
  const fullName = input.fullName.trim();
  if (fullName.length < 2) return { ok: false, error: "invalid" };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("students")
    .insert({ full_name: fullName, birth_date: input.birthDate, class_id: input.classId })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/students`);
  return { ok: true, id: data.id };
}

export async function updateStudentStatus(
  locale: string,
  id: string,
  status: StudentStatus,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("students").update({ status }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/students`);
  revalidatePath(`/${locale}/crm/students/${id}`);
  return { ok: true };
}

export async function updateStudentNotes(
  locale: string,
  id: string,
  notes: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("students")
    .update({ notes: notes || null })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/students/${id}`);
  return { ok: true };
}

/** Перевод в другой класс — через SQL-функцию 0004, которая ведёт историю зачислений. */
export async function transferStudent(
  locale: string,
  studentId: string,
  classId: string,
  reason?: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("transfer_student", {
    p_student_id: studentId,
    p_class_id: classId,
    p_reason: reason ?? null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/students`);
  revalidatePath(`/${locale}/crm/students/${studentId}`);
  revalidatePath(`/${locale}/crm/classes`);
  return { ok: true };
}
