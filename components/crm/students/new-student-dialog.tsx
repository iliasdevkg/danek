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
import { Input, NativeSelect } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createStudent } from "@/lib/actions/students";
import type { ClassOption } from "@/lib/crm/students-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";

export function NewStudentDialog({
  locale,
  t,
  classes,
}: {
  locale: Locale;
  t: Dictionary;
  classes: ClassOption[];
}) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [classId, setClassId] = useState("");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      const result = await createStudent(locale, {
        fullName,
        birthDate: birthDate || null,
        classId: classId || null,
      });

      if (result.ok) {
        toast({ title: t.crm.students.addStudent, tone: "success" });
        setOpen(false);
        setFullName("");
        setBirthDate("");
        setClassId("");
        if (result.id) router.push(routes.crmStudent(locale, result.id));
      } else {
        toast({ title: t.common.error, tone: "danger" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t.crm.students.addStudent}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader>
          <DialogTitle>{t.crm.students.addStudent}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>{t.form.fullName}</FieldLabel>
            <FieldControl>
              {(props) => (
                <Input {...props} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              )}
            </FieldControl>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel optionalLabel={t.common.optional}>{t.form.birthDate}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <Input
                    {...props}
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                )}
              </FieldControl>
            </Field>

            <Field>
              <FieldLabel optionalLabel={t.common.optional}>
                {t.crm.students.detail.class}
              </FieldLabel>
              <FieldControl>
                {(props) => (
                  <NativeSelect
                    {...props}
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                  >
                    <option value="">{t.crm.students.noClass}</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.gradeLevel}
                        {c.letter}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </FieldControl>
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button loading={isPending} disabled={fullName.trim().length < 2} onClick={submit}>
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
