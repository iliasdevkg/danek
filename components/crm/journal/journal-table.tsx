"use client";

import { useRef, useState, useTransition } from "react";

import { AttendanceCell } from "./attendance-cell";
import { GradeCell } from "./grade-cell";
import { Textarea } from "@/components/ui/input";
import { updateLessonDetails } from "@/lib/actions/journal";
import type { RosterStudent, StudentGradeEntry } from "@/lib/crm/journal-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { AttendanceStatus } from "@/lib/supabase/database.types";

export function JournalTable({
  locale,
  t,
  lessonId,
  subjectId,
  termId,
  roster,
  attendance,
  grades,
  initialTopic,
  initialHomework,
}: {
  locale: Locale;
  t: Dictionary;
  lessonId: string;
  subjectId: string;
  termId: string;
  roster: RosterStudent[];
  attendance: Record<string, AttendanceStatus>;
  grades: Record<string, StudentGradeEntry[]>;
  initialTopic: string;
  initialHomework: string;
}) {
  const [topic, setTopic] = useState(initialTopic);
  const [homework, setHomework] = useState(initialHomework);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Тема и домашка сохраняются через паузу в наборе, а не на каждую букву.
  function saveDetails(nextTopic: string, nextHomework: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        await updateLessonDetails(locale, lessonId, nextTopic, nextHomework);
      });
    }, 700);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            saveDetails(e.target.value, homework);
          }}
          placeholder={t.crm.journal.topic}
          rows={2}
        />
        <Textarea
          value={homework}
          onChange={(e) => {
            setHomework(e.target.value);
            saveDetails(topic, e.target.value);
          }}
          placeholder={t.crm.journal.homework}
          rows={2}
        />
      </div>

      <div className="border-rule bg-paper-raised overflow-x-auto rounded-md border">
        <table className="text-small w-full text-left">
          <thead>
            <tr className="border-rule text-caption text-ink-faint border-b">
              <th className="px-4 py-3 font-medium">{t.crm.students.table.name}</th>
              <th className="px-4 py-3 font-medium">{t.crm.journal.attendance}</th>
              <th className="px-4 py-3 font-medium">{t.crm.journal.grades}</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((student) => (
              <tr key={student.id} className="border-rule border-b last:border-b-0">
                <td className="text-ink px-4 py-2.5 font-medium">{student.fullName}</td>
                <td className="px-4 py-2.5">
                  <AttendanceCell
                    locale={locale}
                    t={t}
                    lessonId={lessonId}
                    studentId={student.id}
                    status={attendance[student.id] ?? "present"}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <GradeCell
                    locale={locale}
                    t={t}
                    lessonId={lessonId}
                    studentId={student.id}
                    subjectId={subjectId}
                    termId={termId}
                    grades={grades[student.id] ?? []}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
