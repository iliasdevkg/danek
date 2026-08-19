import "server-only";

import { pickI18n } from "@/lib/content/i18n-value";
import type { Locale } from "@/lib/i18n/config";
import { createServerSupabase } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/lib/supabase/database.types";

export type MyChild = {
  id: string;
  fullName: string;
  className: string | null;
  isPrimary: boolean;
};

/** Дети текущего родителя — RLS сама ограничивает выборку своими. */
export async function getMyChildren(userId: string): Promise<MyChild[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("student_guardians")
    .select("is_primary, students(id, full_name, classes(grade_level, letter))")
    .eq("guardian_id", userId);

  if (error) return [];

  return (
    data as unknown as {
      is_primary: boolean;
      students: {
        id: string;
        full_name: string;
        classes: { grade_level: number; letter: string } | null;
      } | null;
    }[]
  )
    .filter((row) => row.students)
    .map((row) => ({
      id: row.students!.id,
      fullName: row.students!.full_name,
      className: row.students!.classes
        ? `${row.students!.classes.grade_level}${row.students!.classes.letter}`
        : null,
      isPrimary: row.is_primary,
    }));
}

/** Тот же запрос для роли student — своя карточка. */
export async function getMyStudentRecord(userId: string): Promise<MyChild | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, classes(grade_level, letter)")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as {
    id: string;
    full_name: string;
    classes: { grade_level: number; letter: string } | null;
  };
  return {
    id: row.id,
    fullName: row.full_name,
    className: row.classes ? `${row.classes.grade_level}${row.classes.letter}` : null,
    isPrimary: true,
  };
}

export type SubjectGradeSummary = {
  subjectId: string;
  subjectName: string;
  average: number | null;
  finalValue: number | null;
};

export async function getChildTermGrades(
  studentId: string,
  locale: Locale,
): Promise<SubjectGradeSummary[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("term_grades")
    .select(
      "average, final_value, subjects(id, name), terms!inner(academic_years!inner(is_current))",
    )
    .eq("student_id", studentId)
    .eq("terms.academic_years.is_current", true);

  if (error) return [];

  return (
    data as unknown as {
      average: number | null;
      final_value: number | null;
      subjects: { id: string; name: import("@/lib/supabase/database.types").I18nText } | null;
    }[]
  )
    .filter((row) => row.subjects)
    .map((row) => ({
      subjectId: row.subjects!.id,
      subjectName: pickI18n(row.subjects!.name, locale),
      average: row.average,
      finalValue: row.final_value,
    }))
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName, "ru"));
}

export type AttendanceLogRow = {
  date: string;
  subjectName: string;
  status: AttendanceStatus;
};

export async function getChildAttendance(
  studentId: string,
  locale: Locale,
  limit = 20,
): Promise<AttendanceLogRow[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("attendance")
    .select("status, lessons(held_on, schedule_entries(subjects(name)))")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  return (
    data as unknown as {
      status: AttendanceStatus;
      lessons: {
        held_on: string;
        schedule_entries: {
          subjects: { name: import("@/lib/supabase/database.types").I18nText } | null;
        } | null;
      } | null;
    }[]
  )
    .filter((row) => row.lessons)
    .map((row) => ({
      date: row.lessons!.held_on,
      subjectName: row.lessons!.schedule_entries?.subjects
        ? pickI18n(row.lessons!.schedule_entries.subjects.name, locale)
        : "—",
      status: row.status,
    }));
}

export async function getAttendanceSummary(
  studentId: string,
): Promise<{ absent: number; late: number }> {
  const supabase = await createServerSupabase();

  const [{ count: absent }, { count: late }] = await Promise.all([
    supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("status", "absent"),
    supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("status", "late"),
  ]);

  return { absent: absent ?? 0, late: late ?? 0 };
}
