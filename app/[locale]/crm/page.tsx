import Link from "next/link";
import { ClipboardList, GraduationCap, Phone, Users2 } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/crm/application-status-badge";
import { StatCard } from "@/components/crm/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { getDashboardStats, getRecentApplications, isOfficeRole } from "@/lib/crm/queries";
import { formatPhone } from "@/lib/content/site-settings";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/lib/routes";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { notFound } from "next/navigation";

export default async function CrmDashboardPage({ params }: PageProps<"/[locale]/crm">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireRole(locale, "admin", "manager", "teacher");
  const t = await getDictionary(locale);
  const office = isOfficeRole(user.role);

  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    office ? getRecentApplications(6) : Promise.resolve([]),
  ]);

  const d = t.crm.dashboard;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h1 text-ink">{d.title}</h1>
        <p className="text-small text-ink-muted mt-1">{d.lead}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {office ? (
          <StatCard
            icon={ClipboardList}
            label={d.newApplications}
            value={stats.newApplications7d}
            hint={d.newApplicationsHint}
          />
        ) : null}
        <StatCard
          icon={GraduationCap}
          label={d.activeStudents}
          value={stats.activeStudents}
          hint={d.activeStudentsHint}
        />
        <StatCard
          icon={Users2}
          label={d.classesCount}
          value={stats.classesCount}
          hint={d.classesCountHint}
        />
        {office ? (
          <StatCard
            icon={Users2}
            label={d.teachersCount}
            value={stats.teachersCount}
            hint={d.teachersCountHint}
          />
        ) : null}
      </div>

      {office ? (
        <section className="border-rule bg-paper-raised rounded-md border">
          <div className="border-rule flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-h3 text-ink">{d.recentApplications}</h2>
            <Link
              href={routes.crmApplications(locale)}
              className="text-small text-accent decoration-accent/35 hover:decoration-accent underline underline-offset-4"
            >
              {d.viewAll}
            </Link>
          </div>

          {recent.length > 0 ? (
            <ul>
              {recent.map((app) => (
                <li key={app.id}>
                  <Link
                    href={routes.crmApplications(locale, app.id)}
                    className="border-rule hover:bg-paper-sunken flex flex-col gap-2 border-b px-5 py-3.5 transition-colors last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-small text-ink font-medium">{app.childName}</p>
                      <p className="text-caption text-ink-faint flex items-center gap-1.5">
                        <Phone className="size-3" />
                        <span data-numeric>{formatPhone(app.parentPhone)}</span>
                        <span>· {app.parentName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-caption text-ink-faint" data-numeric>
                        {formatDateTime(app.createdAt, locale)}
                      </span>
                      <ApplicationStatusBadge status={app.status} t={t} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              className="border-none"
              icon={<ClipboardList className="size-7" />}
              title={d.recentApplications}
              description={d.noApplications}
            />
          )}
        </section>
      ) : null}

      <section>
        <h2 className="text-h3 text-ink">{d.quickActions}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {office ? (
            <Link
              href={routes.crmStudents(locale)}
              className={buttonVariants({ variant: "secondary" })}
            >
              {d.addStudent}
            </Link>
          ) : null}
          {office ? (
            <Link
              href={routes.crmApplications(locale)}
              className={buttonVariants({ variant: "secondary" })}
            >
              {d.addApplication}
            </Link>
          ) : null}
          <Link
            href={routes.crmClasses(locale)}
            className={buttonVariants({ variant: "secondary" })}
          >
            {d.manageClasses}
          </Link>
        </div>
      </section>
    </div>
  );
}
