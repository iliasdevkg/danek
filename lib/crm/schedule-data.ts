import "server-only";

import { pickI18n } from "@/lib/content/i18n-value";
import type { Locale } from "@/lib/i18n/config";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Weekday } from "@/lib/supabase/database.types";

export type ScheduleEntry = {
  id: string;
  weekday: Weekday;
  slotId: string;
  slotPosition: number;
  slotStart: string;
  slotEnd: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room: string | null;
};

export type LessonSlotOption = { id: string; position: number; startsAt: string; endsAt: string };
export type SubjectOption = { id: string; name: string };
export type ScheduleTeacherOption = { id: string; fullName: string };

export async function getLessonSlots(): Promise<LessonSlotOption[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("lesson_slots")
    .select("id, position, starts_at, ends_at")
    .order("position");
  if (error) return [];
  return data.map((row) => ({
    id: row.id,
    position: row.position,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  }));
}

export async function getScheduleSubjects(locale: Locale): Promise<SubjectOption[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");
  if (error) return [];
  return data.map((row) => ({ id: row.id, name: pickI18n(row.name, locale) }));
}

export async function getScheduleTeachers(): Promise<ScheduleTeacherOption[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("teachers")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name");
  if (error) return [];
  return data.map((row) => ({ id: row.id, fullName: row.full_name }));
}

type Row = {
  id: string;
  weekday: Weekday;
  room: string | null;
  lesson_slots: { id: string; position: number; starts_at: string; ends_at: string } | null;
  subjects: { id: string; name: import("@/lib/supabase/database.types").I18nText } | null;
  teachers: { id: string; full_name: string } | null;
};

export async function getClassSchedule(classId: string, locale: Locale): Promise<ScheduleEntry[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("schedule_entries")
    .select(
      "id, weekday, room, lesson_slots(id, position, starts_at, ends_at), subjects(id, name), teachers(id, full_name)",
    )
    .eq("class_id", classId);

  if (error) {
    console.error("[crm] не удалось прочитать расписание:", error.message);
    return [];
  }

  return (data as unknown as Row[])
    .filter((row) => row.lesson_slots && row.subjects && row.teachers)
    .map((row) => ({
      id: row.id,
      weekday: row.weekday,
      slotId: row.lesson_slots!.id,
      slotPosition: row.lesson_slots!.position,
      slotStart: row.lesson_slots!.starts_at,
      slotEnd: row.lesson_slots!.ends_at,
      subjectId: row.subjects!.id,
      subjectName: pickI18n(row.subjects!.name, locale),
      teacherId: row.teachers!.id,
      teacherName: row.teachers!.full_name,
      room: row.room,
    }))
    .sort((a, b) => a.slotPosition - b.slotPosition);
}
