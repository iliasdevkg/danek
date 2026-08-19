"use server";

import { revalidatePath } from "next/cache";

import { getApplicationHistory, type ApplicationEvent } from "@/lib/crm/applications-data";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ApplicationSource, ApplicationStatus } from "@/lib/supabase/database.types";
import { isValidKgPhone, normalizePhone } from "@/lib/validation/phone";

/**
 * Обёртка над серверным чтением истории, передаваемая клиентской доске как проп.
 * Next сериализует серверный экшен в ссылку — клиентский компонент вызывает его
 * как обычную async-функцию, а cookies и RLS остаются на сервере.
 */
export async function fetchApplicationHistory(id: string): Promise<ApplicationEvent[]> {
  return getApplicationHistory(id);
}

export type ActionResult = { ok: true } | { ok: false; error: string };

function pathFor(locale: string) {
  return `/${locale}/crm/applications`;
}

/**
 * Смена статуса — и перетаскиванием карточки, и из детальной панели.
 *
 * История в application_events пишется триггером applications_log_status_change
 * из миграции 0002, поэтому здесь только сам update — двойной записи не будет.
 */
export async function updateApplicationStatus(
  locale: string,
  id: string,
  status: ApplicationStatus,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(pathFor(locale));
  return { ok: true };
}

export async function assignApplication(
  locale: string,
  id: string,
  assigneeId: string | null,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("applications")
    .update({ assigned_to: assigneeId })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(pathFor(locale));
  return { ok: true };
}

export async function scheduleTrial(
  locale: string,
  id: string,
  trialAt: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("applications")
    .update({ status: "trial_scheduled", trial_at: trialAt })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  await supabase.from("application_events").insert({
    application_id: id,
    type: "trial_scheduled",
    body: trialAt,
  });

  revalidatePath(pathFor(locale));
  return { ok: true };
}

export async function rejectApplication(
  locale: string,
  id: string,
  reason: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("applications")
    .update({ status: "rejected", rejection_reason: reason || null })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(pathFor(locale));
  return { ok: true };
}

export async function addApplicationNote(
  locale: string,
  id: string,
  body: string,
): Promise<ActionResult> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "empty" };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("application_events").insert({
    application_id: id,
    type: "note",
    body: trimmed,
    author_id: user?.id ?? null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(pathFor(locale));
  return { ok: true };
}

export type CreateApplicationInput = {
  childName: string;
  gradeLevel: number | null;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  message: string | null;
  source: ApplicationSource;
};

/**
 * Ручное занесение заявки сотрудником — звонок в приёмную, встреча у ворот,
 * инстаграм-директ. В отличие от публичной формы, здесь нет антиспама и
 * честного «source: website»: источник указывает сам сотрудник.
 */
export async function createManualApplication(
  locale: string,
  input: CreateApplicationInput,
): Promise<ActionResult> {
  const childName = input.childName.trim();
  const parentName = input.parentName.trim();
  const phone = normalizePhone(input.parentPhone.trim());

  if (childName.length < 2 || parentName.length < 2) {
    return { ok: false, error: "invalid" };
  }
  if (!isValidKgPhone(phone)) {
    return { ok: false, error: "invalid_phone" };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("applications").insert({
    child_name: childName,
    grade_level: input.gradeLevel,
    parent_name: parentName,
    parent_phone: phone,
    parent_email: input.parentEmail?.trim() || null,
    message: input.message?.trim() || null,
    source: input.source,
    status: "new",
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(pathFor(locale));
  return { ok: true };
}

/**
 * Зачисление в школу — единственная операция, которая создаёт личное дело
 * ученика. Логика целиком в Postgres-функции (0005), чтобы вставка ученика
 * и обновление заявки происходили одной транзакцией, а не двумя запросами
 * подряд с шансом рассинхрона между ними.
 */
export async function convertApplicationToStudent(
  locale: string,
  id: string,
): Promise<ActionResult & { studentId?: string }> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("convert_application_to_student", {
    p_application_id: id,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(pathFor(locale));
  revalidatePath(`/${locale}/crm/students`);
  return { ok: true, studentId: data };
}
