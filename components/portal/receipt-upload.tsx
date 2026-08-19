"use client";

import { Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { submitPayment } from "@/lib/actions/finance";
import { createBrowserSupabase } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * Загрузка чека — прямо из браузера в приватный бакет Storage, минуя сервер
 * приложения: файл не проходит через нашу функцию, а идёт сразу в Supabase.
 * Путь "<studentId>/<uuid>.<ext>" — то, что проверяет RLS-политика бакета.
 */
export function ReceiptUpload({
  locale,
  t,
  studentId,
  invoiceId,
  amount,
}: {
  locale: Locale;
  t: Dictionary;
  studentId: string;
  invoiceId: string;
  amount: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const toast = useToast();
  const p = t.portal.payments;

  function handleFile(file: File) {
    startTransition(async () => {
      const supabase = createBrowserSupabase();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${studentId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("receipts").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

      if (uploadError) {
        toast({ title: t.common.error, description: uploadError.message, tone: "danger" });
        return;
      }

      const result = await submitPayment(locale, invoiceId, amount, "qr", path);
      if (result.ok) {
        setDone(true);
        toast({ title: p.receiptUploaded, tone: "success" });
      } else {
        toast({ title: t.common.error, description: result.error, tone: "danger" });
      }
    });
  }

  if (done) {
    return <p className="text-small text-success">{p.receiptUploaded}</p>;
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button
        variant="secondary"
        size="sm"
        loading={isPending}
        loadingLabel={p.uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-3.5" />
        {p.uploadReceipt}
      </Button>
    </div>
  );
}
