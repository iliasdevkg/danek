import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type {
  ApplicationEventType,
  ApplicationSource,
  ApplicationStatus,
} from "@/lib/supabase/database.types";

export type BoardApplication = {
  id: string;
  childName: string;
  gradeLevel: number | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  message: string | null;
  status: ApplicationStatus;
  source: ApplicationSource;
  assignedTo: { id: string; fullName: string } | null;
  trialAt: string | null;
  studentId: string | null;
  rejectionReason: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  child_name: string;
  grade_level: number | null;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  message: string | null;
  status: ApplicationStatus;
  source: ApplicationSource;
  trial_at: string | null;
  student_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  assigned_to: string | null;
  assignee: { id: string; full_name: string } | null;
};

function toBoardApplication(row: Row): BoardApplication {
  return {
    id: row.id,
    childName: row.child_name,
    gradeLevel: row.grade_level,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    parentEmail: row.parent_email,
    message: row.message,
    status: row.status,
    source: row.source,
    assignedTo: row.assignee ? { id: row.assignee.id, fullName: row.assignee.full_name } : null,
    trialAt: row.trial_at,
    studentId: row.student_id,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
  };
}

/** Все незакрытые + недавно закрытые заявки — доска CRM держит всю воронку в памяти клиента. */
export async function getBoardApplications(): Promise<BoardApplication[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, child_name, grade_level, parent_name, parent_phone, parent_email, message, status, source, trial_at, student_id, rejection_reason, created_at, assigned_to, assignee:profiles!applications_assigned_to_fkey(id, full_name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[crm] не удалось прочитать заявки:", error.message);
    return [];
  }

  return (data as unknown as Row[]).map(toBoardApplication);
}

export type ApplicationEvent = {
  id: string;
  type: ApplicationEventType;
  body: string | null;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus | null;
  authorName: string | null;
  createdAt: string;
};

export async function getApplicationHistory(applicationId: string): Promise<ApplicationEvent[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("application_events")
    .select("id, type, body, from_status, to_status, created_at, author:profiles(full_name)")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[crm] не удалось прочитать историю заявки:", error.message);
    return [];
  }

  return (
    data as unknown as {
      id: string;
      type: ApplicationEventType;
      body: string | null;
      from_status: ApplicationStatus | null;
      to_status: ApplicationStatus | null;
      created_at: string;
      author: { full_name: string } | null;
    }[]
  ).map((row) => ({
    id: row.id,
    type: row.type,
    body: row.body,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    authorName: row.author?.full_name ?? null,
    createdAt: row.created_at,
  }));
}

export type StaffMember = { id: string; fullName: string };

/** Список сотрудников для назначения ответственного — админ, менеджер. */
export async function getAssignableStaff(): Promise<StaffMember[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["admin", "manager"])
    .eq("is_active", true)
    .order("full_name");

  if (error) return [];
  return data.map((row) => ({ id: row.id, fullName: row.full_name }));
}
