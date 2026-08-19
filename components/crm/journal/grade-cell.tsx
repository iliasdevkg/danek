"use client";

import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";

import { NativeSelect } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addGrade, deleteGrade } from "@/lib/actions/journal";
import type { StudentGradeEntry } from "@/lib/crm/journal-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { GradeKind } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const VALUES = [5, 4, 3, 2];
const KINDS: GradeKind[] = ["lesson", "homework", "test", "term", "exam"];

const VALUE_TONE: Record<number, string> = {
  5: "bg-success-soft text-success",
  4: "bg-accent-soft text-accent",
  3: "bg-warning-soft text-warning",
  2: "bg-danger-soft text-danger",
};

/**
 * Оценки одного ученика по предмету за четверть — рядом чипами, плюс кнопка
 * добавления. Клик по чипу удаляет — учитель может исправить опечатку сам,
 * не выпрашивая доступ у администратора.
 */
export function GradeCell({
  locale,
  t,
  lessonId,
  studentId,
  subjectId,
  termId,
  grades,
}: {
  locale: Locale;
  t: Dictionary;
  lessonId: string | null;
  studentId: string;
  subjectId: string;
  termId: string;
  grades: StudentGradeEntry[];
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(5);
  const [kind, setKind] = useState<GradeKind>("lesson");
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await addGrade(locale, {
        lessonId,
        studentId,
        subjectId,
        termId,
        kind,
        value,
      });
      if (result.ok) setOpen(false);
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteGrade(locale, id);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {grades.map((grade) => (
        <button
          key={grade.id}
          type="button"
          onClick={() => remove(grade.id)}
          disabled={isPending}
          title={t.crm.journal.gradeKind[grade.kind]}
          className={cn(
            "group text-caption relative grid size-7 place-items-center rounded-xs font-semibold",
            VALUE_TONE[grade.value],
          )}
        >
          <span className="group-hover:opacity-0">{grade.value}</span>
          <X className="absolute size-3 opacity-0 group-hover:opacity-100" aria-hidden="true" />
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t.crm.journal.addGrade}
            className="border-rule-strong text-ink-faint hover:border-accent hover:text-accent grid size-7 place-items-center rounded-xs border border-dashed transition-colors"
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="flex flex-col gap-3">
          <div className="flex gap-1.5">
            {VALUES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValue(v)}
                className={cn(
                  "text-small grid size-9 place-items-center rounded-sm font-semibold transition-colors",
                  value === v ? VALUE_TONE[v] : "bg-paper-sunken text-ink-muted hover:bg-rule",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <NativeSelect value={kind} onChange={(e) => setKind(e.target.value as GradeKind)}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t.crm.journal.gradeKind[k]}
              </option>
            ))}
          </NativeSelect>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="bg-accent text-small text-accent-fg rounded-sm px-3 py-1.5 font-medium transition-opacity disabled:opacity-50"
          >
            {t.crm.journal.addGrade}
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
