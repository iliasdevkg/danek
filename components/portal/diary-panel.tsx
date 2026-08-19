import { StatCard } from "@/components/crm/stat-card";
import { formatDate } from "@/lib/format";
import type { AttendanceLogRow, SubjectGradeSummary } from "@/lib/crm/parent-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const VALUE_TONE: Record<number, string> = {
  5: "bg-success-soft text-success",
  4: "bg-accent-soft text-accent",
  3: "bg-warning-soft text-warning",
  2: "bg-danger-soft text-danger",
};

const ATTENDANCE_TONE = {
  present: "text-success",
  absent: "text-danger",
  late: "text-warning",
  excused: "text-accent",
} as const;

/**
 * Дневник — оценки и посещаемость на одном экране. Родитель заходит раз в
 * несколько дней, ему нужна картина целиком, а не переключение между вкладками.
 */
export function DiaryPanel({
  grades,
  attendance,
  summary,
  locale,
  t,
}: {
  grades: SubjectGradeSummary[];
  attendance: AttendanceLogRow[];
  summary: { absent: number; late: number };
  locale: Locale;
  t: Dictionary;
}) {
  const d = t.portal.diary;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={AlertTriangle} label={d.absencesCount} value={summary.absent} />
        <StatCard icon={Clock} label={d.lateCount} value={summary.late} />
      </div>

      <section>
        <h2 className="text-h3 text-ink">{d.gradesTitle}</h2>
        {grades.length > 0 ? (
          <div className="border-rule bg-paper-raised mt-4 overflow-x-auto rounded-md border">
            <table className="text-small w-full text-left">
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.subjectId} className="border-rule border-b last:border-b-0">
                    <td className="text-ink px-4 py-3 font-medium">{grade.subjectName}</td>
                    <td className="text-caption text-ink-faint px-4 py-3" data-numeric>
                      {d.average}: {grade.average ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {grade.finalValue ? (
                        <span
                          className={cn(
                            "text-small inline-grid size-8 place-items-center rounded-sm font-semibold",
                            VALUE_TONE[grade.finalValue],
                          )}
                        >
                          {grade.finalValue}
                        </span>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-small text-ink-faint mt-4">{d.noGrades}</p>
        )}
      </section>

      <section>
        <h2 className="text-h3 text-ink">{d.recentTitle}</h2>
        {attendance.length > 0 ? (
          <ul className="mt-4 flex flex-col">
            {attendance.map((row, index) => (
              <li
                key={index}
                className="rule-b first:rule-t flex items-center justify-between py-2.5"
              >
                <span className="text-small text-ink">{row.subjectName}</span>
                <span className="flex items-center gap-3">
                  <span className={cn("text-caption font-medium", ATTENDANCE_TONE[row.status])}>
                    {d.status[row.status]}
                  </span>
                  <span className="text-caption text-ink-faint" data-numeric>
                    {formatDate(row.date, locale)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-small text-ink-faint mt-4">{d.noAttendance}</p>
        )}
      </section>
    </div>
  );
}
