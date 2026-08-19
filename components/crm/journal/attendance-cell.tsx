"use client";

import { useTransition } from "react";

import { markAttendance } from "@/lib/actions/journal";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { AttendanceStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const CYCLE: AttendanceStatus[] = ["present", "absent", "late", "excused"];

const STYLE: Record<AttendanceStatus, string> = {
  present: "bg-success-soft text-success",
  absent: "bg-danger-soft text-danger",
  late: "bg-warning-soft text-warning",
  excused: "bg-accent-soft text-accent",
};

const LETTER: Record<AttendanceStatus, string> = {
  present: "П",
  absent: "Н",
  late: "О",
  excused: "У",
};

/**
 * Один клик — следующий статус по кругу. Учитель отмечает класс из 25 человек
 * за секунды, не открывая меню на каждого: это самый частый жест в журнале,
 * и он обязан быть однокнопочным.
 */
export function AttendanceCell({
  locale,
  t,
  lessonId,
  studentId,
  status,
}: {
  locale: Locale;
  t: Dictionary;
  lessonId: string;
  studentId: string;
  status: AttendanceStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function cycle() {
    const next = CYCLE[(CYCLE.indexOf(status) + 1) % CYCLE.length];
    startTransition(async () => {
      await markAttendance(locale, lessonId, studentId, next);
    });
  }

  return (
    <button
      type="button"
      onClick={cycle}
      disabled={isPending}
      title={t.crm.journal.status[status]}
      className={cn(
        "text-small grid size-9 place-items-center rounded-sm font-medium transition-[opacity,transform] duration-[150ms]",
        "active:scale-95",
        STYLE[status],
        isPending && "opacity-50",
      )}
    >
      {LETTER[status]}
    </button>
  );
}
