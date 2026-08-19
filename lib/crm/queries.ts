import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type { AppRole, ApplicationStatus } from "@/lib/supabase/database.types";

export type DashboardStats = {
  newApplications7d: number;
  activeStudents: number;
  classesCount: number;
  teachersCount: number;
};

export type RecentApplication = {
  id: string;
  childName: string;
  parentName: string;
  parentPhone: string;
  status: ApplicationStatus;
  gradeLevel: number | null;
  createdAt: string;
};

/**
 * Цифры для дашборда — параллельными count-запросами.
 *
 * `head: true` просит Postgres посчитать `count(*)`, не выгружая ни одной строки:
 * дашборд открывается сотнями раз в день, и на 2000 учениках эта разница ощутима.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerSupabase();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [newApplications, activeStudents, classes, teachers] = await Promise.all([
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase.from("teachers").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return {
    newApplications7d: newApplications.count ?? 0,
    activeStudents: activeStudents.count ?? 0,
    classesCount: classes.count ?? 0,
    teachersCount: teachers.count ?? 0,
  };
}

export async function getRecentApplications(limit = 6): Promise<RecentApplication[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("applications")
    .select("id, child_name, parent_name, parent_phone, status, grade_level, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[crm] не удалось прочитать последние заявки:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    childName: row.child_name,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    status: row.status,
    gradeLevel: row.grade_level,
    createdAt: row.created_at,
  }));
}

/** Учителя видят только свои классы — дашборду учителя нужен более узкий запрос. */
export async function getTeacherClassCount(userId: string): Promise<number> {
  const supabase = await createServerSupabase();

  const { count } = await supabase
    .from("classes")
    .select("id, teachers!inner(profile_id)", { count: "exact", head: true })
    .eq("teachers.profile_id", userId);

  return count ?? 0;
}

export function isOfficeRole(role: AppRole): boolean {
  return role === "admin" || role === "manager";
}
