"use client";

import { useTransition } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteScheduleEntry } from "@/lib/actions/schedule";
import type { LessonSlotOption, ScheduleEntry } from "@/lib/crm/schedule-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { Weekday } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * Сетка недели: строки — уроки по звонкам, столбцы — дни. На телефоне сетка
 * не сжимается до нечитаемого — колонка дня становится минимум 8rem и вся
 * таблица уезжает вбок в собственном скролл-контейнере, а не давит на layout.
 */
export function ScheduleGrid({
  entries,
  slots,
  locale,
  t,
}: {
  entries: ScheduleEntry[];
  slots: LessonSlotOption[];
  locale: Locale;
  t: Dictionary;
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const byCell = new Map<string, ScheduleEntry>();
  for (const entry of entries) byCell.set(`${entry.weekday}:${entry.slotId}`, entry);

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteScheduleEntry(locale, id);
      if (!result.ok) toast({ title: t.common.error, tone: "danger" });
    });
  }

  return (
    <div className="border-rule overflow-x-auto rounded-md border">
      <table className="text-small w-full border-collapse">
        <thead>
          <tr>
            <th className="border-rule bg-paper-sunken text-caption text-ink-faint w-24 border-b p-2 text-left" />
            {WEEKDAYS.map((day) => (
              <th
                key={day}
                className="border-rule bg-paper-sunken text-caption text-ink-muted min-w-32 border-b border-l p-2 text-left font-medium"
              >
                {t.crm.schedule.weekdays[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.id}>
              <td
                className="border-rule bg-paper-sunken text-caption text-ink-faint border-b p-2 align-top"
                data-numeric
              >
                {slot.position}
                <br />
                {slot.startsAt.slice(0, 5)}
              </td>
              {WEEKDAYS.map((day) => {
                const entry = byCell.get(`${day}:${slot.id}`);
                return (
                  <td key={day} className="border-rule border-b border-l p-1.5 align-top">
                    {entry ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "bg-accent-soft w-full rounded-sm p-2 text-left transition-opacity",
                              isPending && "opacity-50",
                            )}
                          >
                            <p className="text-accent font-medium">{entry.subjectName}</p>
                            <p className="text-caption text-ink-muted mt-0.5">
                              {entry.teacherName}
                            </p>
                            {entry.room ? (
                              <p className="text-caption text-ink-faint">{entry.room}</p>
                            ) : null}
                          </button>
                        </DialogTrigger>
                        <DialogContent closeLabel={t.common.close}>
                          <DialogHeader>
                            <DialogTitle>{entry.subjectName}</DialogTitle>
                          </DialogHeader>
                          <p className="text-small text-ink-muted">{entry.teacherName}</p>
                          <DialogFooter>
                            <Button
                              variant="danger"
                              loading={isPending}
                              onClick={() => remove(entry.id)}
                            >
                              {t.crm.schedule.form.remove}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
