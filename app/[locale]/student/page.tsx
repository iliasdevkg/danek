import { notFound } from "next/navigation";
import { Users2 } from "lucide-react";

import { AnnouncementsPanel } from "@/components/portal/announcements-panel";
import { DiaryPanel } from "@/components/portal/diary-panel";
import { PortalTabs } from "@/components/portal/portal-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { getAnnouncements } from "@/lib/crm/announcements-data";
import {
  getAttendanceSummary,
  getChildAttendance,
  getChildTermGrades,
  getMyStudentRecord,
} from "@/lib/crm/parent-data";
import { requireRole } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function StudentPage({ params }: PageProps<"/[locale]/student">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireRole(locale, "student");
  const t = await getDictionary(locale);

  const me = await getMyStudentRecord(user.id);

  if (!me) {
    return (
      <EmptyState
        icon={<Users2 className="size-7" />}
        title={t.portal.diary.title}
        description="—"
      />
    );
  }

  const [grades, attendance, summary, announcements] = await Promise.all([
    getChildTermGrades(me.id, locale),
    getChildAttendance(me.id, locale),
    getAttendanceSummary(me.id),
    getAnnouncements(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink">{t.portal.diary.title}</h1>

      <PortalTabs
        t={t}
        diary={
          <DiaryPanel
            grades={grades}
            attendance={attendance}
            summary={summary}
            locale={locale}
            t={t}
          />
        }
        payments={null}
        announcements={<AnnouncementsPanel announcements={announcements} locale={locale} t={t} />}
      />
    </div>
  );
}
