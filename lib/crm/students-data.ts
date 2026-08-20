import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type { GuardianRelation, StudentStatus } from "@/lib/supabase/database.types";

export type StudentListItem = {
  id: string;
  fullName: string;
  status: StudentStatus;
  enrolledOn: string;
  class: { id: string; gradeLevel: number; letter: string } | null;
  guardianCount: number;
};

type ListRow = {
  id: string;
  full_name: string;
  status: StudentStatus;
  enrolled_on: string;
  classes: { id: string; grade_level: number; letter: string } | null;
  student_guardians: { count: number }[] | null;
};

/**
 * Список учеников для таблицы CRM.
 *
 * Класс и число опекунов подтягиваются одним запросом через relationship —
 * без него список из 40 учеников превратился бы в 40 дополнительных round-trip.
 */
export async function getStudentsList(filters: {
  search?: string;
  classId?: string;
  status?: StudentStatus;
}): Promise<StudentListItem[]> {
  const supabase = await createServerSupabase();

  let query = supabase
    .from("students")
    .select(
      "id, full_name, status, enrolled_on, classes(id, grade_level, letter), student_guardians(count)",
    )
    .order("full_name", { ascending: true });

  if (filters.search) query = query.ilike("full_name", `%${filters.search}%`);
  if (filters.classId) query = query.eq("class_id", filters.classId);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;

  if (error) {
    console.error("[crm] не удалось прочитать учеников:", error.message);
    return [];
  }

  return (data as unknown as ListRow[]).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    status: row.status,
    enrolledOn: row.enrolled_on,
    class: row.classes
      ? { id: row.classes.id, gradeLevel: row.classes.grade_level, letter: row.classes.letter }
      : null,
    guardianCount: row.student_guardians?.[0]?.count ?? 0,
  }));
}

export type StudentDetail = StudentListItem & {
  birthDate: string | null;
  photoPath: string | null;
  notes: string | null;
  guardians: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    relation: GuardianRelation;
    isPrimary: boolean;
    canPickUp: boolean;
  }[];
};

export async function getStudentDetail(id: string): Promise<StudentDetail | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("students")
    .select(
      `id, full_name, status, enrolled_on, birth_date, photo_path, notes,
       classes(id, grade_level, letter),
       student_guardians(relation, is_primary, can_pick_up, profiles(id, full_name, phone, email))`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[crm] не удалось прочитать ученика:", error.message);
    return null;
  }

  const row = data as unknown as {
    id: string;
    full_name: string;
    status: StudentStatus;
    enrolled_on: string;
    birth_date: string | null;
    photo_path: string | null;
    notes: string | null;
    classes: { id: string; grade_level: number; letter: string } | null;
    student_guardians:
      | {
          relation: GuardianRelation;
          is_primary: boolean;
          can_pick_up: boolean;
          profiles: {
            id: string;
            full_name: string;
            phone: string | null;
            email: string | null;
          } | null;
        }[]
      | null;
  };

  return {
    id: row.id,
    fullName: row.full_name,
    status: row.status,
    enrolledOn: row.enrolled_on,
    birthDate: row.birth_date,
    photoPath: row.photo_path,
    notes: row.notes,
    class: row.classes
      ? { id: row.classes.id, gradeLevel: row.classes.grade_level, letter: row.classes.letter }
      : null,
    guardianCount: row.student_guardians?.length ?? 0,
    guardians: (row.student_guardians ?? []).flatMap((g) =>
      g.profiles
        ? [
            {
              id: g.profiles.id,
              fullName: g.profiles.full_name,
              phone: g.profiles.phone,
              email: g.profiles.email,
              relation: g.relation,
              isPrimary: g.is_primary,
              canPickUp: g.can_pick_up,
            },
          ]
        : [],
    ),
  };
}

export type ClassOption = { id: string; gradeLevel: number; letter: string; studentCount: number };

export async function getClassOptions(): Promise<ClassOption[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("classes")
    .select("id, grade_level, letter, students(count)")
    .order("grade_level")
    .order("letter");

  if (error) return [];

  return (
    data as unknown as {
      id: string;
      grade_level: number;
      letter: string;
      students: { count: number }[];
    }[]
  ).map((row) => ({
    id: row.id,
    gradeLevel: row.grade_level,
    letter: row.letter,
    studentCount: row.students?.[0]?.count ?? 0,
  }));
}
