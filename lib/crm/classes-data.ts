import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";

export type ClassListItem = {
  id: string;
  gradeLevel: number;
  letter: string;
  capacity: number;
  studentCount: number;
  homeroomTeacher: { id: string; fullName: string } | null;
};

type Row = {
  id: string;
  grade_level: number;
  letter: string;
  capacity: number;
  students: { count: number }[];
  teachers: { id: string; full_name: string } | null;
};

export async function getClassesList(): Promise<ClassListItem[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("classes")
    .select("id, grade_level, letter, capacity, students(count), teachers(id, full_name)")
    .order("grade_level")
    .order("letter");

  if (error) {
    console.error("[crm] не удалось прочитать классы:", error.message);
    return [];
  }

  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    gradeLevel: row.grade_level,
    letter: row.letter,
    capacity: row.capacity,
    studentCount: row.students?.[0]?.count ?? 0,
    homeroomTeacher: row.teachers
      ? { id: row.teachers.id, fullName: row.teachers.full_name }
      : null,
  }));
}

export type ClassDetail = ClassListItem & {
  academicYear: string;
  roster: { id: string; fullName: string; status: string }[];
};

export async function getClassDetail(id: string): Promise<ClassDetail | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("classes")
    .select(
      "id, grade_level, letter, capacity, academic_years(name), teachers(id, full_name), students(id, full_name, status)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[crm] не удалось прочитать класс:", error.message);
    return null;
  }

  const row = data as unknown as {
    id: string;
    grade_level: number;
    letter: string;
    capacity: number;
    academic_years: { name: string } | null;
    teachers: { id: string; full_name: string } | null;
    students: { id: string; full_name: string; status: string }[];
  };

  return {
    id: row.id,
    gradeLevel: row.grade_level,
    letter: row.letter,
    capacity: row.capacity,
    academicYear: row.academic_years?.name ?? "",
    homeroomTeacher: row.teachers
      ? { id: row.teachers.id, fullName: row.teachers.full_name }
      : null,
    studentCount: row.students.length,
    roster: row.students
      .filter((s) => s.status === "active")
      .sort((a, b) => a.full_name.localeCompare(b.full_name, "ru"))
      .map((s) => ({ id: s.id, fullName: s.full_name, status: s.status })),
  };
}

export type TeacherOption = { id: string; fullName: string };

export async function getTeacherOptions(): Promise<TeacherOption[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("teachers")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name");

  if (error) return [];
  return data.map((row) => ({ id: row.id, fullName: row.full_name }));
}

export type AcademicYearOption = { id: string; name: string; isCurrent: boolean };

export async function getAcademicYears(): Promise<AcademicYearOption[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("academic_years")
    .select("id, name, is_current")
    .order("starts_on", { ascending: false });

  if (error) return [];
  return data.map((row) => ({ id: row.id, name: row.name, isCurrent: row.is_current }));
}
