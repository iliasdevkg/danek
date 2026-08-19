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
import { NativeSelect } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { transferStudent } from "@/lib/actions/students";
import type { ClassOption } from "@/lib/crm/students-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

export function TransferClassDialog({
  locale,
  t,
  studentId,
  currentClassId,
  classes,
}: {
  locale: Locale;
  t: Dictionary;
  studentId: string;
  currentClassId: string | null;
  classes: ClassOption[];
}) {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(currentClassId ?? "");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function submit() {
    if (!classId) return;
    startTransition(async () => {
      const result = await transferStudent(locale, studentId, classId);
      if (result.ok) {
        toast({ title: t.crm.students.detail.transferClass, tone: "success" });
        setOpen(false);
      } else {
        toast({ title: t.common.error, description: result.error, tone: "danger" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          {t.crm.students.detail.transferClass}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader>
          <DialogTitle>{t.crm.students.detail.transferClass}</DialogTitle>
        </DialogHeader>

        <Field>
          <FieldLabel>{t.crm.students.detail.class}</FieldLabel>
          <FieldControl>
            {(props) => (
              <NativeSelect {...props} value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="" disabled>
                  {t.crm.students.noClass}
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.gradeLevel}
                    {c.letter} · {c.studentCount}
                  </option>
                ))}
              </NativeSelect>
            )}
          </FieldControl>
        </Field>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button
            loading={isPending}
            disabled={!classId || classId === currentClassId}
            onClick={submit}
          >
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
