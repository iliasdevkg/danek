import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { HomeroomSelect } from "@/components/crm/classes/homeroom-select";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import { getClassDetail, getTeacherOptions } from "@/lib/crm/classes-data";
import { isOfficeRole } from "@/lib/crm/queries";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export default async function ClassDetailPage({ params }: PageProps<"/[locale]/crm/classes/[id]">) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireRole(locale, "admin", "manager", "teacher");
  const t = await getDictionary(locale);
  const office = isOfficeRole(user.role);

  const [cls, teachers] = await Promise.all([
    getClassDetail(id),
    office ? getTeacherOptions() : Promise.resolve([]),
  ]);
  if (!cls) notFound();

  const c = t.crm.classes;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link
        href={routes.crmClasses(locale)}
        className="text-small text-ink-muted hover:text-ink flex w-fit items-center gap-1.5"
      >
        <ArrowLeft className="size-3.5" />
        {c.title}
      </Link>

      <div>
        <h1 className="font-display text-h1 text-ink">
          {cls.gradeLevel}
          {cls.letter}
        </h1>
        {cls.academicYear ? (
          <p className="text-small text-ink-muted mt-1">{cls.academicYear}</p>
        ) : null}
      </div>

      <div className="max-w-xs">
        <p className="text-kicker text-ink-faint uppercase">{c.detail.homeroomTeacher}</p>
        <div className="mt-2">
          {office ? (
            <HomeroomSelect
              locale={locale}
              t={t}
              classId={cls.id}
              currentTeacherId={cls.homeroomTeacher?.id ?? null}
              teachers={teachers}
            />
          ) : (
            <p className="text-small text-ink">{cls.homeroomTeacher?.fullName ?? c.noHomeroom}</p>
          )}
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-ink">{c.detail.roster}</h2>
          <span className="text-caption text-ink-faint" data-numeric>
            {cls.roster.length}/{cls.capacity}
          </span>
        </div>

        {cls.roster.length > 0 ? (
          <ul className="mt-4 flex flex-col">
            {cls.roster.map((student) => (
              <li key={student.id} className="rule-b first:rule-t py-2.5">
                <Link
                  href={routes.crmStudent(locale, student.id)}
                  className="text-small text-ink hover:text-accent"
                >
                  {student.fullName}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState className="mt-4" title={c.detail.roster} description={c.detail.emptyRoster} />
        )}
      </section>
    </div>
  );
}
