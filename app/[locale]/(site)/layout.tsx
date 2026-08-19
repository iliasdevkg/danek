import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { SchoolJsonLd } from "@/components/site/json-ld";
import { getSiteContacts } from "@/lib/content/site-settings";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Витрина пересобирается раз в час.
 *
 * Родитель всегда получает готовый HTML с CDN, а правки контактов и новостей
 * доезжают сами — без выката и без запроса в базу на каждый визит.
 */
export const revalidate = 3600;

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, contacts] = await Promise.all([getDictionary(locale), getSiteContacts()]);

  return (
    <>
      <a href="#main" className="skip-link">
        {t.nav.skipToContent}
      </a>

      <SiteHeader locale={locale} t={t} contacts={contacts} />

      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>

      <SiteFooter locale={locale} t={t} contacts={contacts} />

      <SchoolJsonLd locale={locale} t={t} contacts={contacts} />
    </>
  );
}
