import { notFound } from "next/navigation";
import { Megaphone } from "lucide-react";

import { NewAnnouncementDialog } from "@/components/crm/announcements/new-announcement-dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import { getAnnouncements } from "@/lib/crm/announcements-data";
import { getClassesList } from "@/lib/crm/classes-data";
import { isOfficeRole } from "@/lib/crm/queries";
import { formatDateTime } from "@/lib/format";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function AnnouncementsPage({
  params,
}: PageProps<"/[locale]/crm/announcements">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireRole(locale, "admin", "manager", "teacher");
  const t = await getDictionary(locale);
  const office = isOfficeRole(user.role);

  const [announcements, classes] = await Promise.all([
    getAnnouncements(),
    office ? getClassesList() : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">{t.crm.announcements.title}</h1>
          <p className="text-small text-ink-muted mt-1">{t.crm.announcements.lead}</p>
        </div>
        {office ? <NewAnnouncementDialog locale={locale} t={t} classes={classes} /> : null}
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-7" />}
          title={t.crm.announcements.title}
          description={t.crm.announcements.empty}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((item) => (
            <article key={item.id} className="border-rule bg-paper-raised rounded-md border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-h3 text-ink">{item.title}</h2>
                <Badge tone="neutral">
                  {item.audience === "class" && item.className
                    ? item.className
                    : t.crm.announcements.audience[item.audience]}
                </Badge>
              </div>
              <p className="text-small text-ink-muted mt-2 whitespace-pre-wrap">{item.body}</p>
              <p className="text-caption text-ink-faint mt-3">
                {item.authorName ? `${item.authorName} · ` : ""}
                <span data-numeric>{formatDateTime(item.publishedAt, locale)}</span>
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
