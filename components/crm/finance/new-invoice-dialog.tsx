"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createInvoice } from "@/lib/actions/finance";
import type { StudentOption } from "@/lib/crm/finance-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

function firstAndLastOfMonth(): { start: string; end: string; due: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const due = new Date(now.getFullYear(), now.getMonth(), 10);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end), due: iso(due) };
}

export function NewInvoiceDialog({
  locale,
  t,
  students,
}: {
  locale: Locale;
  t: Dictionary;
  students: StudentOption[];
}) {
  const defaults = firstAndLastOfMonth();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [periodStart, setPeriodStart] = useState(defaults.start);
  const [periodEnd, setPeriodEnd] = useState(defaults.end);
  const [amount, setAmount] = useState("");
  const [dueOn, setDueOn] = useState(defaults.due);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const f = t.crm.finance.form;

  function submit() {
    startTransition(async () => {
      const result = await createInvoice(locale, {
        studentId,
        periodStart,
        periodEnd,
        amount: Number.parseFloat(amount),
        dueOn,
        note: note || null,
      });

      if (result.ok) {
        toast({ title: t.crm.finance.newInvoice, tone: "success" });
        setOpen(false);
        setAmount("");
        setNote("");
      } else {
        toast({ title: t.common.error, tone: "danger" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!students.length}>{t.crm.finance.newInvoice}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader>
          <DialogTitle>{t.crm.finance.newInvoice}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>{f.student}</FieldLabel>
            <FieldControl>
              {(props) => (
                <NativeSelect
                  {...props}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FieldControl>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>{f.periodStart}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <Input
                    {...props}
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                )}
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel>{f.periodEnd}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <Input
                    {...props}
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                )}
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel>{f.amount}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <Input
                    {...props}
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-numeric
                  />
                )}
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel>{f.dueOn}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <Input
                    {...props}
                    type="date"
                    value={dueOn}
                    onChange={(e) => setDueOn(e.target.value)}
                  />
                )}
              </FieldControl>
            </Field>
          </div>

          <Field>
            <FieldLabel optionalLabel={t.common.optional}>{f.note}</FieldLabel>
            <FieldControl>
              {(props) => (
                <Textarea
                  {...props}
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              )}
            </FieldControl>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button loading={isPending} disabled={!studentId || !amount} onClick={submit}>
            {f.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
