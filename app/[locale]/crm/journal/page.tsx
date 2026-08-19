import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";

import { JournalFilters } from "@/components/crm/journal/journal-filters";
import { JournalTable } from "@/components/crm/journal/journal-table";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import { getClassesList } from "@/lib/crm/classes-data";
import {
  getClassRoster,
  getClassScheduleSlots,
  getCurrentTerm,
  getLessonForDate,
  getSubjectGrades,
  weekdayOf,
} from "@/lib/crm/journal-data";
import { openLesson } from "@/lib/actions/journal";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function JournalPage({
  params,
  searchParams,
}: PageProps<"/[locale]/crm/journal">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireRole(locale, "admin", "manager", "teacher");
  const t = await getDictionary(locale);
  const search = await searchParams;

  const classes = await getClassesList();
  const classId = typeof search.class === "string" ? search.class : classes[0]?.id;
  const date = typeof search.date === "string" ? search.date : todayIso();

  const scheduleSlots = classId ? await getClassScheduleSlots(classId, locale) : [];
  const weekday = weekdayOf(date);
  const todaysSubjects = scheduleSlots.filter((slot) => slot.weekday === weekday);

  const subjectId =
    typeof search.subject === "string" && todaysSubjects.some((s) => s.subjectId === search.subject)
      ? search.subject
      : todaysSubjects[0]?.subjectId;

  const slot = todaysSubjects.find((s) => s.subjectId === subjectId);
  const term = await getCurrentTerm();

  // Урок открывается лениво: первый заход учителя в этот день создаёт строку lessons.
  const lessonId = slot && term ? await openLesson(slot.scheduleEntryId, date) : null;

  const [roster, lesson, grades] = await Promise.all([
    classId ? getClassRoster(classId) : Promise.resolve([]),
    lessonId ? getLessonForDate(slot!.scheduleEntryId, date) : Promise.resolve(null),
    classId && subjectId && term
      ? getSubjectGrades(classId, subjectId, term.id)
      : Promise.resolve({}),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h1 text-ink">{t.crm.journal.title}</h1>
        <p className="text-small text-ink-muted mt-1">{t.crm.journal.lead}</p>
      </div>

      <JournalFilters
        classes={classes}
        todaysSubjects={todaysSubjects}
        currentClass={classId}
        currentSubject={subjectId}
        currentDate={date}
        t={t}
      />

      {!classId || !term ? (
        <EmptyState
          icon={<BookOpen className="size-7" />}
          title={t.crm.journal.title}
          description={t.crm.journal.noSchedule}
        />
      ) : !slot || !lessonId ? (
        <EmptyState
          icon={<BookOpen className="size-7" />}
          title={t.crm.journal.title}
          description={t.crm.journal.noSchedule}
        />
      ) : (
        <JournalTable
          locale={locale}
          t={t}
          lessonId={lessonId}
          subjectId={subjectId!}
          termId={term.id}
          roster={roster}
          attendance={lesson?.attendance ?? {}}
          grades={grades}
          initialTopic={lesson?.topic ?? ""}
          initialHomework={lesson?.homework ?? ""}
        />
      )}
    </div>
  );
}
