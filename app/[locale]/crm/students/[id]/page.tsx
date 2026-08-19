import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NotesField } from "@/components/crm/students/notes-field";
import { StudentStatusSelect } from "@/components/crm/students/status-select";
import { TransferClassDialog } from "@/components/crm/students/transfer-class-dialog";
import { requireRole } from "@/lib/auth/session";
import { getClassOptions, getStudentDetail } from "@/lib/crm/students-data";
import { formatDate } from "@/lib/format";
import { formatPhone } from "@/lib/content/site-settings";
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

export default async function StudentDetailPage({
  params,
}: PageProps<"/[locale]/crm/students/[id]">) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  await requireRole(locale, "admin", "manager", "teacher");
  const t = await getDictionary(locale);

  const [student, classes] = await Promise.all([getStudentDetail(id), getClassOptions()]);
  if (!student) notFound();

  const s = t.crm.students;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link
        href={routes.crmStudents(locale)}
        className="text-small text-ink-muted hover:text-ink flex w-fit items-center gap-1.5"
      >
        <ArrowLeft className="size-3.5" />
        {s.title}
      </Link>

      <div className="flex items-start gap-4">
        <Avatar fullName={student.fullName} className="text-body size-14" />
        <div className="min-w-0 flex-1">
          <h1 className="text-h1 text-ink">{student.fullName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[student.status]}>{s.status[student.status]}</Badge>
            <span className="text-small text-ink-muted">
              {student.class ? `${student.class.gradeLevel}${student.class.letter}` : s.noClass}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-kicker text-ink-faint uppercase">{s.detail.birthDate}</p>
          <p className="text-small text-ink mt-1.5">
            {student.birthDate ? formatDate(student.birthDate, locale) : "—"}
          </p>
        </div>
        <div>
          <p className="text-kicker text-ink-faint uppercase">{s.detail.enrolledOn}</p>
          <p className="text-small text-ink mt-1.5">{formatDate(student.enrolledOn, locale)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <TransferClassDialog
          locale={locale}
          t={t}
          studentId={student.id}
          currentClassId={student.class?.id ?? null}
          classes={classes}
        />
        <StudentStatusSelect locale={locale} t={t} studentId={student.id} status={student.status} />
      </div>

      <Separator />

      <section>
        <h2 className="text-h3 text-ink">{s.detail.guardians}</h2>

        {student.guardians.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {student.guardians.map((guardian) => (
              <li
                key={guardian.id}
                className="border-rule bg-paper-raised flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
              >
                <div>
                  <p className="text-small text-ink font-medium">
                    {guardian.fullName}
                    {guardian.isPrimary ? (
                      <Badge tone="accent" className="ml-2 align-middle">
                        {s.detail.primary}
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-caption text-ink-faint mt-0.5">
                    {s.detail.relation[guardian.relation]}
                  </p>
                </div>
                {guardian.phone ? (
                  <a
                    href={`tel:${guardian.phone}`}
                    className="text-small text-accent flex items-center gap-1.5 hover:underline"
                    data-numeric
                  >
                    <Phone className="size-3.5" />
                    {formatPhone(guardian.phone)}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-small text-ink-faint mt-3">—</p>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="text-h3 text-ink">{s.detail.notes}</h2>
        <div className="mt-3">
          <NotesField
            locale={locale}
            t={t}
            studentId={student.id}
            initialValue={student.notes ?? ""}
          />
        </div>
      </section>
    </div>
  );
}
