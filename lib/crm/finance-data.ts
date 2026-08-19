import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import type { InvoiceStatus, PaymentMethod, PaymentStatus } from "@/lib/supabase/database.types";

export type InvoiceListItem = {
  id: string;
  number: string;
  studentId: string;
  studentName: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: InvoiceStatus;
  dueOn: string;
};

export async function getInvoices(status?: InvoiceStatus): Promise<InvoiceListItem[]> {
  const supabase = await createServerSupabase();

  let query = supabase
    .from("invoices")
    .select(
      "id, number, student_id, period_start, period_end, amount_kgs, status, due_on, students(full_name)",
    )
    .order("due_on", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[crm] не удалось прочитать начисления:", error.message);
    return [];
  }

  return (
    data as unknown as {
      id: string;
      number: string;
      student_id: string;
      period_start: string;
      period_end: string;
      amount_kgs: number;
      status: InvoiceStatus;
      due_on: string;
      students: { full_name: string } | null;
    }[]
  ).map((row) => ({
    id: row.id,
    number: row.number,
    studentId: row.student_id,
    studentName: row.students?.full_name ?? "—",
    periodStart: row.period_start,
    periodEnd: row.period_end,
    amount: Number(row.amount_kgs),
    status: row.status,
    dueOn: row.due_on,
  }));
}

export type PendingPayment = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  receiptPath: string | null;
  paidAt: string;
};

export async function getPendingPayments(): Promise<PendingPayment[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, invoice_id, amount_kgs, method, receipt_path, paid_at, invoices(number, students(full_name))",
    )
    .eq("status", "pending")
    .order("paid_at");

  if (error) return [];

  return (
    data as unknown as {
      id: string;
      invoice_id: string;
      amount_kgs: number;
      method: PaymentMethod;
      receipt_path: string | null;
      paid_at: string;
      invoices: { number: string; students: { full_name: string } | null } | null;
    }[]
  ).map((row) => ({
    id: row.id,
    invoiceId: row.invoice_id,
    invoiceNumber: row.invoices?.number ?? "—",
    studentName: row.invoices?.students?.full_name ?? "—",
    amount: Number(row.amount_kgs),
    method: row.method,
    receiptPath: row.receipt_path,
    paidAt: row.paid_at,
  }));
}

export type StudentOption = { id: string; fullName: string };

export async function getStudentOptions(): Promise<StudentOption[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("status", "active")
    .order("full_name");

  if (error) return [];
  return data.map((row) => ({ id: row.id, fullName: row.full_name }));
}

// --- Кабинет родителя -------------------------------------------------------

export type ParentInvoice = InvoiceListItem & {
  payments: { id: string; amount: number; status: PaymentStatus; paidAt: string }[];
};

export async function getStudentInvoices(studentId: string): Promise<ParentInvoice[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, number, student_id, period_start, period_end, amount_kgs, status, due_on, students(full_name), payments(id, amount_kgs, status, paid_at)",
    )
    .eq("student_id", studentId)
    .order("due_on", { ascending: false });

  if (error) return [];

  return (
    data as unknown as {
      id: string;
      number: string;
      student_id: string;
      period_start: string;
      period_end: string;
      amount_kgs: number;
      status: InvoiceStatus;
      due_on: string;
      students: { full_name: string } | null;
      payments: { id: string; amount_kgs: number; status: PaymentStatus; paid_at: string }[];
    }[]
  ).map((row) => ({
    id: row.id,
    number: row.number,
    studentId: row.student_id,
    studentName: row.students?.full_name ?? "—",
    periodStart: row.period_start,
    periodEnd: row.period_end,
    amount: Number(row.amount_kgs),
    status: row.status,
    dueOn: row.due_on,
    payments: row.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount_kgs),
      status: p.status,
      paidAt: p.paid_at,
    })),
  }));
}

/** Подписанная ссылка на чек — бакет receipts приватный, публичного URL у него нет. */
export async function getReceiptUrl(path: string | null): Promise<string | null> {
  if (!path) return null;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 60 * 10);

  if (error) {
    console.error("[crm] не удалось подписать ссылку на чек:", error.message);
    return null;
  }
  return data.signedUrl;
}
