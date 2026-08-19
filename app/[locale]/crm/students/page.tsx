import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { StudentsFilters } from "@/components/crm/students/filters";
import { NewStudentDialog } from "@/components/crm/students/new-student-dialog";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import { getClassOptions, getStudentsList } from "@/lib/crm/students-data";
import { formatDate } from "@/lib/format";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { routes } from "@/lib/routes";
import type { StudentStatus } from "@/lib/supabase/database.types";
import type { VariantProps } from "class-variance-authority";

const STATUS_TONE: Record<
  StudentStatus,
  NonNullable<VariantProps<typeof badgeVariants>["tone"]>
> = {
  active: "success",
  graduated: "accent",
  expelled: "danger",
  academic_leave: "warning",
};

export default async function StudentsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/crm/students">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireRole(locale, "admin", "manager", "teacher");
  const t = await getDictionary(locale);
  const search = await searchParams;

  const filters = {
    search: typeof search.search === "string" ? search.search : undefined,
    classId: typeof search.class === "string" ? search.class : undefined,
    status: typeof search.status === "string" ? (search.status as StudentStatus) : undefined,
  };

  const [students, classes] = await Promise.all([getStudentsList(filters), getClassOptions()]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">{t.crm.students.title}</h1>
          <p className="text-small text-ink-muted mt-1">{t.crm.students.lead}</p>
        </div>
        <NewStudentDialog locale={locale} t={t} classes={classes} />
      </div>

      <StudentsFilters classes={classes} t={t} />

      {students.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-7" />}
          title={t.crm.students.title}
          description={t.crm.students.empty}
        />
      ) : (
        <div className="border-rule bg-paper-raised overflow-x-auto rounded-md border">
          <table className="text-small w-full text-left">
            <thead>
              <tr className="border-rule text-caption text-ink-faint border-b">
                <th className="px-4 py-3 font-medium">{t.crm.students.table.name}</th>
                <th className="px-4 py-3 font-medium">{t.crm.students.table.class}</th>
                <th className="px-4 py-3 font-medium">{t.crm.students.table.status}</th>
                <th className="px-4 py-3 font-medium">{t.crm.students.table.guardians}</th>
                <th className="px-4 py-3 font-medium">{t.crm.students.table.enrolledOn}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-rule hover:bg-paper-sunken border-b last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={routes.crmStudent(locale, student.id)}
                      className="text-ink hover:text-accent font-medium"
                    >
                      {student.fullName}
                    </Link>
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {student.class
                      ? `${student.class.gradeLevel}${student.class.letter}`
                      : t.crm.students.noClass}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[student.status]}>
                      {t.crm.students.status[student.status]}
                    </Badge>
                  </td>
                  <td className="text-ink-muted px-4 py-3" data-numeric>
                    {student.guardianCount}
                  </td>
                  <td className="text-ink-muted px-4 py-3" data-numeric>
                    {formatDate(student.enrolledOn, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
