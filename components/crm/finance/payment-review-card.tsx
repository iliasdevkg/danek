"use client";

import { FileText, ExternalLink } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { reviewPayment } from "@/lib/actions/finance";
import { formatMoney } from "@/lib/format";
import type { PendingPayment } from "@/lib/crm/finance-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

export function PaymentReviewCard({
  payment,
  receiptUrl,
  locale,
  t,
}: {
  payment: PendingPayment;
  receiptUrl: string | null;
  locale: Locale;
  t: Dictionary;
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function review(approve: boolean) {
    startTransition(async () => {
      const result = await reviewPayment(locale, payment.id, approve);
      if (result.ok) {
        toast({
          title: approve ? t.crm.finance.confirmPayment : t.crm.finance.rejectPayment,
          tone: approve ? "success" : "info",
        });
      } else {
        toast({ title: t.common.error, description: result.error, tone: "danger" });
      }
    });
  }

  return (
    <div className="border-rule bg-paper-raised flex flex-wrap items-center justify-between gap-4 rounded-md border p-4">
      <div>
        <p className="text-small text-ink font-medium">{payment.studentName}</p>
        <p className="text-caption text-ink-faint mt-0.5">
          {payment.invoiceNumber} · {t.crm.finance.method[payment.method]}
        </p>
      </div>

      <p className="font-display text-h3 text-ink" data-numeric>
        {formatMoney(payment.amount, locale)}
      </p>

      {receiptUrl ? (
        <a
          href={receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-small text-accent flex items-center gap-1.5 hover:underline"
        >
          <FileText className="size-3.5" />
          {t.crm.finance.viewReceipt}
          <ExternalLink className="size-3" />
        </a>
      ) : null}

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" loading={isPending} onClick={() => review(false)}>
          {t.crm.finance.rejectPayment}
        </Button>
        <Button size="sm" loading={isPending} onClick={() => review(true)}>
          {t.crm.finance.confirmPayment}
        </Button>
      </div>
    </div>
  );
}
