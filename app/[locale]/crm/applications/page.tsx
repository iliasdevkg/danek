import { notFound } from "next/navigation";

import { ApplicationsBoard } from "@/components/crm/applications/board";
import { requireRole } from "@/lib/auth/session";
import { fetchApplicationHistory } from "@/lib/actions/applications";
import { getAssignableStaff, getBoardApplications } from "@/lib/crm/applications-data";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function ApplicationsPage({
  params,
}: PageProps<"/[locale]/crm/applications">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireRole(locale, "admin", "manager");
  const t = await getDictionary(locale);

  const [applications, staff] = await Promise.all([getBoardApplications(), getAssignableStaff()]);

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col gap-5 lg:h-[calc(100dvh-6rem)]">
      <div>
        <h1 className="text-h1 text-ink">{t.crm.applications.title}</h1>
        <p className="text-small text-ink-muted mt-1">{t.crm.applications.lead}</p>
      </div>

      <ApplicationsBoard
        initialApplications={applications}
        staff={staff}
        fetchHistory={fetchApplicationHistory}
        locale={locale}
        t={t}
      />
    </div>
  );
}
