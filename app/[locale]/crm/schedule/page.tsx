import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";

import { ClassSelector } from "@/components/crm/class-selector";
import { AddLessonDialog } from "@/components/crm/schedule/add-lesson-dialog";
import { ScheduleGrid } from "@/components/crm/schedule/schedule-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import { getClassesList } from "@/lib/crm/classes-data";
import { isOfficeRole } from "@/lib/crm/queries";
import {
  getClassSchedule,
  getLessonSlots,
  getScheduleSubjects,
  getScheduleTeachers,
} from "@/lib/crm/schedule-data";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function SchedulePage({
  params,
  searchParams,
}: PageProps<"/[locale]/crm/schedule">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireRole(locale, "admin", "manager", "teacher");
  const t = await getDictionary(locale);
  const search = await searchParams;
  const office = isOfficeRole(user.role);

  const classes = await getClassesList();
  const classId = typeof search.class === "string" ? search.class : classes[0]?.id;

  const [entries, slots, subjects, teachers] = await Promise.all([
    classId ? getClassSchedule(classId, locale) : Promise.resolve([]),
    getLessonSlots(),
    office ? getScheduleSubjects(locale) : Promise.resolve([]),
    office ? getScheduleTeachers() : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">{t.crm.schedule.title}</h1>
          <p className="text-small text-ink-muted mt-1">{t.crm.schedule.lead}</p>
        </div>
        {office && classId ? (
          <AddLessonDialog
            locale={locale}
            t={t}
            classId={classId}
            subjects={subjects}
            teachers={teachers}
            slots={slots}
          />
        ) : null}
      </div>

      <ClassSelector classes={classes} current={classId} label={t.crm.schedule.selectClass} />

      {!classId ? (
        <EmptyState
          icon={<Calendar className="size-7" />}
          title={t.crm.schedule.title}
          description={t.crm.classes.empty}
        />
      ) : slots.length === 0 ? (
        <EmptyState
          icon={<Calendar className="size-7" />}
          title={t.crm.schedule.title}
          description={t.crm.schedule.empty}
        />
      ) : (
        <ScheduleGrid entries={entries} slots={slots} locale={locale} t={t} />
      )}
    </div>
  );
}
