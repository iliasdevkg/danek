"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import type { Weekday } from "@/lib/supabase/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type CreateScheduleEntryInput = {
  classId: string;
  subjectId: string;
  teacherId: string;
  weekday: Weekday;
  lessonSlotId: string;
  room: string | null;
};

/**
 * Конфликт учителя (тот же учитель, то же время, другой класс) ловит
 * триггер check_teacher_schedule_conflict в БД — здесь только читаемое
 * сообщение вместо кода ошибки Postgres.
 */
export async function createScheduleEntry(
  locale: string,
  input: CreateScheduleEntryInput,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("schedule_entries").insert({
    class_id: input.classId,
    subject_id: input.subjectId,
    teacher_id: input.teacherId,
    weekday: input.weekday,
    lesson_slot_id: input.lessonSlotId,
    room: input.room,
  });

  if (error) {
    if (error.code === "23P01" || error.message.includes("уже ведёт урок")) {
      return { ok: false, error: "conflict" };
    }
    if (error.code === "23505") return { ok: false, error: "duplicate" };
    return { ok: false, error: error.message };
  }

  revalidatePath(`/${locale}/crm/schedule`);
  return { ok: true };
}

export async function deleteScheduleEntry(locale: string, id: string): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("schedule_entries").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/schedule`);
  return { ok: true };
}
