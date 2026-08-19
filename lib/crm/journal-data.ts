import "server-only";

import { pickI18n } from "@/lib/content/i18n-value";
import type { Locale } from "@/lib/i18n/config";
import { createServerSupabase } from "@/lib/supabase/server";
import type { AttendanceStatus, GradeKind, Weekday } from "@/lib/supabase/database.types";

export type ClassSubjectSlot = {
  scheduleEntryId: string;
  subjectId: string;
  subjectName: string;
  weekday: Weekday;
};

const JS_DAY_TO_WEEKDAY: (Weekday | null)[] = [null, "mon", "tue", "wed", "thu", "fri", "sat"];

/** «2026-09-07» → «mon». Воскресенье (0) не отображено — уроков в этот день нет. */
export function weekdayOf(isoDate: string): Weekday | null {
  const day = new Date(`${isoDate}T00:00:00`).getDay();
  return JS_DAY_TO_WEEKDAY[day] ?? null;
}

/**
 * Все уроки этого класса по расписанию — с привязкой к дню недели.
 *
 * Предмет для журнала выбирается не из общего справочника, а именно из того,
 * что по расписанию идёт в выбранный день: иначе учитель мог бы открыть
 * «физкультуру» в день, когда её в этом классе вовсе нет.
 */
export async function getClassScheduleSlots(
  classId: string,
  locale: Locale,
): Promise<ClassSubjectSlot[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("schedule_entries")
    .select("id, weekday, subjects(id, name)")
    .eq("class_id", classId);

  if (error) return [];

  return (
    data as unknown as {
      id: string;
      weekday: Weekday;
      subjects: { id: string; name: import("@/lib/supabase/database.types").I18nText } | null;
    }[]
  )
    .filter((row) => row.subjects)
    .map((row) => ({
      scheduleEntryId: row.id,
      subjectId: row.subjects!.id,
      subjectName: pickI18n(row.subjects!.name, locale),
      weekday: row.weekday,
    }));
}

export type RosterStudent = { id: string; fullName: string };

export async function getClassRoster(classId: string): Promise<RosterStudent[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("class_id", classId)
    .eq("status", "active")
    .order("full_name");

  if (error) return [];
  return data.map((row) => ({ id: row.id, fullName: row.full_name }));
}

export type LessonRecord = {
  id: string;
  topic: string | null;
  homework: string | null;
  attendance: Record<string, AttendanceStatus>;
};

/** Урок на конкретную дату — если ещё не открыт учителем, вернёт null (страница откроет его сама). */
export async function getLessonForDate(
  scheduleEntryId: string,
  heldOn: string,
): Promise<LessonRecord | null> {
  const supabase = await createServerSupabase();

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("id, topic, homework")
    .eq("schedule_entry_id", scheduleEntryId)
    .eq("held_on", heldOn)
    .maybeSingle();

  if (error || !lesson) return null;

  const { data: attendanceRows } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("lesson_id", lesson.id);

  const attendance: Record<string, AttendanceStatus> = {};
  for (const row of attendanceRows ?? []) attendance[row.student_id] = row.status;

  return { id: lesson.id, topic: lesson.topic, homework: lesson.homework, attendance };
}

export type StudentGradeEntry = {
  id: string;
  kind: GradeKind;
  value: number;
  createdAt: string;
};

/** Оценки по предмету за текущую четверть — сгруппированы по ученику. */
export async function getSubjectGrades(
  classId: string,
  subjectId: string,
  termId: string,
): Promise<Record<string, StudentGradeEntry[]>> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("grade_entries")
    .select("id, student_id, kind, value, created_at, students!inner(class_id)")
    .eq("subject_id", subjectId)
    .eq("term_id", termId)
    .eq("students.class_id", classId)
    .order("created_at");

  if (error) return {};

  const byStudent: Record<string, StudentGradeEntry[]> = {};
  for (const row of data as unknown as {
    id: string;
    student_id: string;
    kind: GradeKind;
    value: number;
    created_at: string;
  }[]) {
    (byStudent[row.student_id] ??= []).push({
      id: row.id,
      kind: row.kind,
      value: row.value,
      createdAt: row.created_at,
    });
  }
  return byStudent;
}

export async function getCurrentTerm(): Promise<{ id: string; number: number } | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("terms")
    .select("id, number, academic_years!inner(is_current)")
    .eq("academic_years.is_current", true)
    .lte("starts_on", new Date().toISOString().slice(0, 10))
    .gte("ends_on", new Date().toISOString().slice(0, 10))
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id, number: data.number };
}
