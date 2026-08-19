import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { AnnouncementItem } from "@/lib/crm/announcements-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

export function AnnouncementsPanel({
  announcements,
  locale,
  t,
}: {
  announcements: AnnouncementItem[];
  locale: Locale;
  t: Dictionary;
}) {
  if (announcements.length === 0) {
    return (
      <EmptyState title={t.portal.announcements.title} description={t.portal.announcements.empty} />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {announcements.map((item) => (
        <li key={item.id} className="border-rule bg-paper-raised rounded-md border p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-h3 text-ink">{item.title}</h3>
            {item.className ? <Badge tone="neutral">{item.className}</Badge> : null}
          </div>
          <p className="text-small text-ink-muted mt-2 whitespace-pre-wrap">{item.body}</p>
          <time className="text-caption text-ink-faint mt-3 block" data-numeric>
            {formatDateTime(item.publishedAt, locale)}
          </time>
        </li>
      ))}
    </ul>
  );
}
