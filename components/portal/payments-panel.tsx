import { PaymentQr } from "@/components/portal/payment-qr";
import { ReceiptUpload } from "@/components/portal/receipt-upload";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatMoney } from "@/lib/format";
import type { ParentInvoice } from "@/lib/crm/finance-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { InvoiceStatus, PaymentStatus } from "@/lib/supabase/database.types";
import type { VariantProps } from "class-variance-authority";
import { type badgeVariants } from "@/components/ui/badge";

const INVOICE_TONE: Record<
  InvoiceStatus,
  NonNullable<VariantProps<typeof badgeVariants>["tone"]>
> = {
  open: "warning",
  partially_paid: "accent",
  paid: "success",
  cancelled: "neutral",
};

const PAYMENT_TONE: Record<
  PaymentStatus,
  NonNullable<VariantProps<typeof badgeVariants>["tone"]>
> = {
  pending: "warning",
  confirmed: "success",
  rejected: "danger",
};

export function PaymentsPanel({
  studentId,
  invoices,
  requisites,
  locale,
  t,
}: {
  studentId: string;
  invoices: ParentInvoice[];
  requisites: { bankName: string; account: string; recipient: string; qrPayload: string } | null;
  locale: Locale;
  t: Dictionary;
}) {
  const p = t.portal.payments;
  const openInvoices = invoices.filter(
    (inv) => inv.status === "open" || inv.status === "partially_paid",
  );

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-h3 text-ink">{p.title}</h2>
        <p className="text-small text-ink-muted mt-1 max-w-prose">{p.lead}</p>

        {requisites ? (
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
            {requisites.qrPayload ? <PaymentQr payload={requisites.qrPayload} /> : null}
            <dl className="text-small grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-ink-faint">{p.bankName}</dt>
              <dd className="text-ink">{requisites.bankName}</dd>
              <dt className="text-ink-faint">{p.account}</dt>
              <dd className="text-ink" data-numeric>
                {requisites.account}
              </dd>
              <dt className="text-ink-faint">{p.recipient}</dt>
              <dd className="text-ink">{requisites.recipient}</dd>
            </dl>
          </div>
        ) : (
          <p className="text-small text-ink-faint mt-4">{p.noRequisites}</p>
        )}
      </section>

      <section>
        <h2 className="text-h3 text-ink">{p.invoicesTitle}</h2>

        {invoices.length === 0 ? (
          <EmptyState className="mt-4" title={p.invoicesTitle} description={p.noInvoices} />
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {invoices.map((invoice) => {
              const paid = invoice.payments
                .filter((pay) => pay.status === "confirmed")
                .reduce((sum, pay) => sum + pay.amount, 0);
              const remaining = Math.max(0, invoice.amount - paid);
              const isOpenInvoice = openInvoices.some((i) => i.id === invoice.id);
              const hasPendingPayment = invoice.payments.some((pay) => pay.status === "pending");

              return (
                <li key={invoice.id} className="border-rule bg-paper-raised rounded-md border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-small text-ink font-medium" data-numeric>
                        {invoice.number}
                      </p>
                      <p className="text-caption text-ink-faint mt-0.5">
                        {formatDate(invoice.periodStart, locale)} –{" "}
                        {formatDate(invoice.periodEnd, locale)}
                      </p>
                    </div>
                    <Badge tone={INVOICE_TONE[invoice.status]}>
                      {t.crm.finance.status[invoice.status]}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    <div className="text-caption text-ink-muted flex gap-4">
                      <span data-numeric>
                        {p.amountPaid}: {formatMoney(paid, locale)}
                      </span>
                      {remaining > 0 ? (
                        <span className="text-ink font-medium" data-numeric>
                          {p.remaining}: {formatMoney(remaining, locale)}
                        </span>
                      ) : null}
                    </div>

                    {isOpenInvoice && !hasPendingPayment ? (
                      <ReceiptUpload
                        locale={locale}
                        t={t}
                        studentId={studentId}
                        invoiceId={invoice.id}
                        amount={remaining}
                      />
                    ) : hasPendingPayment ? (
                      <Badge tone={PAYMENT_TONE.pending}>
                        {t.crm.finance.paymentStatus.pending}
                      </Badge>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
