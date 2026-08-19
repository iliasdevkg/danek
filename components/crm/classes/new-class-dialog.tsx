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
import { createClass } from "@/lib/actions/classes";
import type { AcademicYearOption, TeacherOption } from "@/lib/crm/classes-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

export function NewClassDialog({
  locale,
  t,
  academicYears,
  teachers,
}: {
  locale: Locale;
  t: Dictionary;
  academicYears: AcademicYearOption[];
  teachers: TeacherOption[];
}) {
  const currentYear = academicYears.find((y) => y.isCurrent) ?? academicYears[0];
  const [open, setOpen] = useState(false);
  const [gradeLevel, setGradeLevel] = useState("1");
  const [letter, setLetter] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [capacity, setCapacity] = useState("25");
  const [yearId, setYearId] = useState(currentYear?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function submit() {
    startTransition(async () => {
      const result = await createClass(locale, {
        academicYearId: yearId,
        gradeLevel: Number.parseInt(gradeLevel, 10),
        letter,
        homeroomTeacherId: teacherId || null,
        capacity: Number.parseInt(capacity, 10) || 25,
      });

      if (result.ok) {
        toast({ title: t.crm.classes.addClass, tone: "success" });
        setOpen(false);
        setLetter("");
      } else {
        toast({ title: t.common.error, tone: "danger" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={academicYears.length === 0}>{t.crm.classes.addClass}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader>
          <DialogTitle>{t.crm.classes.addClass}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>{t.tuitionPage.gradeColumn}</FieldLabel>
            <FieldControl>
              {(props) => (
                <NativeSelect
                  {...props}
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                >
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FieldControl>
          </Field>

          <Field>
            <FieldLabel>{t.crm.classes.letterLabel}</FieldLabel>
            <FieldControl>
              {(props) => (
                <Input
                  {...props}
                  value={letter}
                  maxLength={2}
                  onChange={(e) => setLetter(e.target.value)}
                />
              )}
            </FieldControl>
          </Field>

          <Field>
            <FieldLabel optionalLabel={t.common.optional}>
              {t.crm.classes.table.homeroom}
            </FieldLabel>
            <FieldControl>
              {(props) => (
                <NativeSelect
                  {...props}
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">{t.crm.classes.noHomeroom}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FieldControl>
          </Field>

          <Field>
            <FieldLabel>{t.crm.classes.table.capacity}</FieldLabel>
            <FieldControl>
              {(props) => (
                <Input
                  {...props}
                  type="number"
                  min={1}
                  max={60}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              )}
            </FieldControl>
          </Field>

          {academicYears.length > 1 ? (
            <Field className="sm:col-span-2">
              <FieldLabel>{t.crm.classes.academicYearLabel}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <NativeSelect
                    {...props}
                    value={yearId}
                    onChange={(e) => setYearId(e.target.value)}
                  >
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </FieldControl>
            </Field>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button loading={isPending} disabled={!letter.trim() || !yearId} onClick={submit}>
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
