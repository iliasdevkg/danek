"use client";

import { useRef, useState, useTransition } from "react";

import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { updateStudentNotes } from "@/lib/actions/students";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/** Автосохранение через паузу в наборе — отдельной кнопки «Сохранить» не нужно. */
export function NotesField({
  locale,
  t,
  studentId,
  initialValue,
}: {
  locale: Locale;
  t: Dictionary;
  studentId: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function schedule(next: string) {
    setValue(next);
    setStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Пауза в наборе перед отправкой: заметка сохраняется не на каждую букву,
    // а через секунду тишины — как в любом нормальном автосохранении.
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await updateStudentNotes(locale, studentId, next);
        setStatus(result.ok ? "saved" : "idle");
        if (!result.ok) toast({ title: t.common.error, tone: "danger" });
      });
    }, 900);
  }

  return (
    <div>
      <Textarea
        value={value}
        onChange={(event) => schedule(event.target.value)}
        placeholder={t.crm.students.detail.notesPlaceholder}
        rows={4}
      />
      <p className="text-caption text-ink-faint mt-1.5">
        {isPending || status === "saving"
          ? t.common.sending
          : status === "saved"
            ? t.crm.settings.saved
            : " "}
      </p>
    </div>
  );
}
