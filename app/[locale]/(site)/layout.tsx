import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { SchoolJsonLd } from "@/components/site/json-ld";
import { VisitMemory } from "@/components/site/visit-memory";
import { getSiteContacts } from "@/lib/content/site-settings";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { routes, siteNavItems } from "@/lib/routes";

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
    /*
     * `data-surface="cinema"` включает тёмный набор переменных из globals.css.
     * Он стоит на обёртке витрины, а не на <html>: за её пределами — в CRM
     * и кабинетах — продолжает действовать светлый набор, и переключатель
     * темы там работает как прежде.
     *
     * Фон задан здесь же явно: элемент не на всю высоту документа, и без
     * заливки под коротким разделом просвечивал бы белый <body>.
     */
    <div data-surface="cinema" className="bg-paper text-ink min-h-dvh">
      <a href="#main" className="skip-link">
        {t.nav.skipToContent}
      </a>

      {/* Полоса прочитанного под шапкой. Её ширину двигает сама прокрутка —
          ни обработчика, ни пересчёта на каждый кадр. */}
      <div
        aria-hidden="true"
        className="bg-accent fx-progress fixed inset-x-0 top-0 z-50 h-px origin-left"
      />

      <SiteHeader locale={locale} t={t} contacts={contacts} />

      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>

      <SiteFooter locale={locale} t={t} contacts={contacts} />

      <SchoolJsonLd locale={locale} t={t} contacts={contacts} />

      {/* Единственный клиентский кусочек витрины. Живёт в макете, а не на
          главной: раздел нужно записать при переходе на любую страницу,
          а поздороваться — только на главной. */}
      <VisitMemory
        items={siteNavItems(locale, t)}
        homeHref={routes.home(locale)}
        labels={{
          welcomeBack: t.memory.welcomeBack,
          continueHint: t.memory.continueHint,
          continueAction: t.memory.continueAction,
          dismiss: t.memory.dismiss,
        }}
      />
    </div>
  );
}
