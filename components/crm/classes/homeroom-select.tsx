"use client";

import { useTransition } from "react";

import { NativeSelect } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { updateClassHomeroom } from "@/lib/actions/classes";
import type { TeacherOption } from "@/lib/crm/classes-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

export function HomeroomSelect({
  locale,
  t,
  classId,
  currentTeacherId,
  teachers,
}: {
  locale: Locale;
  t: Dictionary;
  classId: string;
  currentTeacherId: string | null;
  teachers: TeacherOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <NativeSelect
      defaultValue={currentTeacherId ?? ""}
      disabled={isPending}
      onChange={(event) => {
        const teacherId = event.target.value || null;
        startTransition(async () => {
          const result = await updateClassHomeroom(locale, classId, teacherId);
          if (result.ok) toast({ title: t.crm.classes.detail.homeroomTeacher, tone: "success" });
          else toast({ title: t.common.error, description: result.error, tone: "danger" });
        });
      }}
    >
      <option value="">{t.crm.classes.noHomeroom}</option>
      {teachers.map((teacher) => (
        <option key={teacher.id} value={teacher.id}>
          {teacher.fullName}
        </option>
      ))}
    </NativeSelect>
  );
}
