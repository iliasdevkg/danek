import { notFound } from "next/navigation";
import { Users2 } from "lucide-react";

import { AnnouncementsPanel } from "@/components/portal/announcements-panel";
import { ChildSelector } from "@/components/portal/child-selector";
import { DiaryPanel } from "@/components/portal/diary-panel";
import { PaymentsPanel } from "@/components/portal/payments-panel";
import { PortalTabs } from "@/components/portal/portal-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { getAnnouncements } from "@/lib/crm/announcements-data";
import { getStudentInvoices } from "@/lib/crm/finance-data";
import {
  getAttendanceSummary,
  getChildAttendance,
  getChildTermGrades,
  getMyChildren,
} from "@/lib/crm/parent-data";
import { getAllSiteSettings } from "@/lib/crm/settings-data";
import { requireRole } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default async function ParentPage({ params, searchParams }: PageProps<"/[locale]/parent">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireRole(locale, "parent");
  const t = await getDictionary(locale);
  const search = await searchParams;

  const children = await getMyChildren(user.id);

  if (children.length === 0) {
    return (
      <EmptyState
        icon={<Users2 className="size-7" />}
        title={t.portal.tabs.diary}
        description="—"
      />
    );
  }

  const childId =
    typeof search.child === "string" && children.some((c) => c.id === search.child)
      ? search.child
      : children[0].id;

  const [grades, attendance, summary, invoices, settings, announcements] = await Promise.all([
    getChildTermGrades(childId, locale),
    getChildAttendance(childId, locale),
    getAttendanceSummary(childId),
    getStudentInvoices(childId),
    getAllSiteSettings(),
    getAnnouncements(),
  ]);

  const qrPayload = asString(settings["payment.qr_payload"]);
  const bankName = asString(settings["payment.bank_name"]);
  const account = asString(settings["payment.account"]);
  const recipient = asString(settings["payment.recipient"]);
  const requisites =
    bankName || account || recipient ? { bankName, account, recipient, qrPayload } : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h1 text-ink">{t.portal.diary.title}</h1>
        <ChildSelector options={children} current={childId} label={t.portal.childSwitcher} />
      </div>

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
        payments={
          <PaymentsPanel
            studentId={childId}
            invoices={invoices}
            requisites={requisites}
            locale={locale}
            t={t}
          />
        }
        announcements={<AnnouncementsPanel announcements={announcements} locale={locale} t={t} />}
      />
    </div>
  );
}
