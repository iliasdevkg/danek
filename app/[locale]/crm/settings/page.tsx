import { notFound } from "next/navigation";

import { SettingsForm } from "@/components/crm/settings/settings-form";
import { requireRole } from "@/lib/auth/session";
import { getAllSiteSettings } from "@/lib/crm/settings-data";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function CrmSettingsPage({ params }: PageProps<"/[locale]/crm/settings">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireRole(locale, "admin");
  const t = await getDictionary(locale);
  const settings = await getAllSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1 text-ink">{t.crm.settings.title}</h1>
        <p className="text-small text-ink-muted mt-1">{t.crm.settings.lead}</p>
      </div>

      <SettingsForm locale={locale} t={t} initial={settings} />
    </div>
  );
}
