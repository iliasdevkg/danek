"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Input, NativeSelect } from "@/components/ui/input";
import type { ClassSubjectSlot } from "@/lib/crm/journal-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

export function JournalFilters({
  classes,
  /** Только предметы, которые идут по расписанию именно в выбранный день. */
  todaysSubjects,
  currentClass,
  currentSubject,
  currentDate,
  t,
}: {
  classes: { id: string; gradeLevel: number; letter: string }[];
  todaysSubjects: ClassSubjectSlot[];
  currentClass?: string;
  currentSubject?: string;
  currentDate: string;
  t: Dictionary;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key === "class") params.delete("subject");
    router.push(`?${params.toString()}` as never, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <NativeSelect
        aria-label={t.crm.journal.selectClass}
        value={currentClass ?? ""}
        onChange={(e) => setParam("class", e.target.value)}
        className="w-auto"
      >
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.gradeLevel}
            {c.letter}
          </option>
        ))}
      </NativeSelect>

      <NativeSelect
        aria-label={t.crm.journal.selectSubject}
        value={currentSubject ?? ""}
        onChange={(e) => setParam("subject", e.target.value)}
        className="w-auto"
        disabled={todaysSubjects.length === 0}
      >
        {todaysSubjects.length === 0 ? (
          <option value="">{t.crm.journal.noSchedule}</option>
        ) : (
          todaysSubjects.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.subjectName}
            </option>
          ))
        )}
      </NativeSelect>

      <Input
        type="date"
        aria-label={t.crm.journal.selectDate}
        value={currentDate}
        onChange={(e) => setParam("date", e.target.value)}
        className="w-auto"
      />
    </div>
  );
}
