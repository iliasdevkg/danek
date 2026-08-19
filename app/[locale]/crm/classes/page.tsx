import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";

import { NewClassDialog } from "@/components/crm/classes/new-class-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import { getAcademicYears, getClassesList, getTeacherOptions } from "@/lib/crm/classes-data";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isOfficeRole } from "@/lib/crm/queries";
import { routes } from "@/lib/routes";

export default async function ClassesPage({ params }: PageProps<"/[locale]/crm/classes">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireRole(locale, "admin", "manager", "teacher");
  const t = await getDictionary(locale);
  const office = isOfficeRole(user.role);

  const [classes, teachers, years] = await Promise.all([
    getClassesList(),
    office ? getTeacherOptions() : Promise.resolve([]),
    office ? getAcademicYears() : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">{t.crm.classes.title}</h1>
          <p className="text-small text-ink-muted mt-1">{t.crm.classes.lead}</p>
        </div>
        {office ? (
          <NewClassDialog locale={locale} t={t} academicYears={years} teachers={teachers} />
        ) : null}
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={<Users className="size-7" />}
          title={t.crm.classes.title}
          description={t.crm.classes.empty}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link
              key={cls.id}
              href={routes.crmClass(locale, cls.id)}
              className="border-rule bg-paper-raised hover:border-rule-strong flex flex-col gap-3 rounded-md border p-5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-h2 text-ink">
                  {cls.gradeLevel}
                  {cls.letter}
                </p>
                <p className="text-caption text-ink-faint" data-numeric>
                  {cls.studentCount}/{cls.capacity}
                </p>
              </div>
              <p className="text-small text-ink-muted">
                {cls.homeroomTeacher?.fullName ?? t.crm.classes.noHomeroom}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
