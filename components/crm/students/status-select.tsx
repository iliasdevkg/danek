"use client";

import { useTransition } from "react";

import { NativeSelect } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { updateStudentStatus } from "@/lib/actions/students";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { StudentStatus } from "@/lib/supabase/database.types";

const STATUSES: StudentStatus[] = ["active", "graduated", "expelled", "academic_leave"];

export function StudentStatusSelect({
  locale,
  t,
  studentId,
  status,
}: {
  locale: Locale;
  t: Dictionary;
  studentId: string;
  status: StudentStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <NativeSelect
      defaultValue={status}
      disabled={isPending}
      className="w-auto"
      onChange={(event) => {
        const next = event.target.value as StudentStatus;
        startTransition(async () => {
          const result = await updateStudentStatus(locale, studentId, next);
          if (result.ok) toast({ title: t.crm.students.table.status, tone: "success" });
          else toast({ title: t.common.error, description: result.error, tone: "danger" });
        });
      }}
    >
      {STATUSES.map((value) => (
        <option key={value} value={value}>
          {t.crm.students.status[value]}
        </option>
      ))}
    </NativeSelect>
  );
}
