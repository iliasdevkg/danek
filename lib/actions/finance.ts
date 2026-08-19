"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import type { PaymentMethod } from "@/lib/supabase/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type CreateInvoiceInput = {
  studentId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  dueOn: string;
  note: string | null;
};

export async function createInvoice(
  locale: string,
  input: CreateInvoiceInput,
): Promise<ActionResult> {
  if (input.amount <= 0) return { ok: false, error: "invalid_amount" };

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("invoices").insert({
    student_id: input.studentId,
    period_start: input.periodStart,
    period_end: input.periodEnd,
    amount_kgs: input.amount,
    due_on: input.dueOn,
    note: input.note,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/finance`);
  return { ok: true };
}

export async function reviewPayment(
  locale: string,
  paymentId: string,
  approve: boolean,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("confirm_payment", {
    p_payment_id: paymentId,
    p_approve: approve,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/crm/finance`);
  revalidatePath(`/${locale}/parent`);
  return { ok: true };
}

/** Родитель загружает чек: файл — в приватный бакет receipts, запись — в payments (pending). */
export async function submitPayment(
  locale: string,
  invoiceId: string,
  amount: number,
  method: PaymentMethod,
  receiptPath: string | null,
): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    amount_kgs: amount,
    method,
    receipt_path: receiptPath,
    submitted_by: user?.id ?? null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/${locale}/parent`);
  return { ok: true };
}
