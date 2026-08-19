import { notFound } from "next/navigation";
import { Wallet } from "lucide-react";

import { NewInvoiceDialog } from "@/components/crm/finance/new-invoice-dialog";
import { PaymentReviewCard } from "@/components/crm/finance/payment-review-card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import {
  getInvoices,
  getPendingPayments,
  getReceiptUrl,
  getStudentOptions,
} from "@/lib/crm/finance-data";
import { formatDate, formatMoney } from "@/lib/format";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { InvoiceStatus } from "@/lib/supabase/database.types";
import type { VariantProps } from "class-variance-authority";

const STATUS_TONE: Record<
  InvoiceStatus,
  NonNullable<VariantProps<typeof badgeVariants>["tone"]>
> = {
  open: "warning",
  partially_paid: "accent",
  paid: "success",
  cancelled: "neutral",
};

export default async function FinancePage({ params }: PageProps<"/[locale]/crm/finance">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireRole(locale, "admin", "manager");
  const t = await getDictionary(locale);

  const [invoices, pending, students] = await Promise.all([
    getInvoices(),
    getPendingPayments(),
    getStudentOptions(),
  ]);

  const receiptUrls = await Promise.all(pending.map((p) => getReceiptUrl(p.receiptPath)));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">{t.crm.finance.title}</h1>
          <p className="text-small text-ink-muted mt-1">{t.crm.finance.lead}</p>
        </div>
        <NewInvoiceDialog locale={locale} t={t} students={students} />
      </div>

      <section>
        <h2 className="text-h3 text-ink">{t.crm.finance.payments}</h2>
        {pending.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {pending.map((payment, index) => (
              <PaymentReviewCard
                key={payment.id}
                payment={payment}
                receiptUrl={receiptUrls[index]}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            title={t.crm.finance.payments}
            description={t.crm.finance.emptyPayments}
          />
        )}
      </section>

      <section>
        <h2 className="text-h3 text-ink">{t.crm.finance.invoices}</h2>
        {invoices.length > 0 ? (
          <div className="border-rule bg-paper-raised mt-4 overflow-x-auto rounded-md border">
            <table className="text-small w-full text-left">
              <thead>
                <tr className="border-rule text-caption text-ink-faint border-b">
                  <th className="px-4 py-3 font-medium">{t.crm.finance.table.number}</th>
                  <th className="px-4 py-3 font-medium">{t.crm.finance.table.student}</th>
                  <th className="px-4 py-3 font-medium">{t.crm.finance.table.amount}</th>
                  <th className="px-4 py-3 font-medium">{t.crm.finance.table.status}</th>
                  <th className="px-4 py-3 font-medium">{t.crm.finance.table.dueOn}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-rule hover:bg-paper-sunken border-b last:border-b-0"
                  >
                    <td className="text-ink-muted px-4 py-3" data-numeric>
                      {invoice.number}
                    </td>
                    <td className="text-ink px-4 py-3 font-medium">{invoice.studentName}</td>
                    <td className="text-ink px-4 py-3" data-numeric>
                      {formatMoney(invoice.amount, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[invoice.status]}>
                        {t.crm.finance.status[invoice.status]}
                      </Badge>
                    </td>
                    <td className="text-ink-muted px-4 py-3" data-numeric>
                      {formatDate(invoice.dueOn, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            icon={<Wallet className="size-7" />}
            title={t.crm.finance.invoices}
            description={t.crm.finance.emptyInvoices}
          />
        )}
      </section>
    </div>
  );
}
