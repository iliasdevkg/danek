import Link from "next/link";
import { Clock, LogIn, MapPin, MessageCircle, Phone } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { LangSwitcher } from "@/components/site/lang-switcher";
import { MobileNav } from "@/components/site/mobile-nav";
import { SiteNav } from "@/components/site/site-nav";
import { Wordmark } from "@/components/site/wordmark";
import { pickI18n } from "@/lib/content/i18n-value";
import { formatPhone, type SiteContacts } from "@/lib/content/site-settings";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { PRIMARY_NAV_KEYS, routes, siteNavItems } from "@/lib/routes";

/**
 * Верхняя служебная полоса.
 *
 * Здесь живёт то, за чем родитель заходит чаще всего и что не должно
 * занимать место в основном меню: как доехать, когда открыто, куда звонить
 * и где кабинет с оценками. На телефоне полоса скрыта — те же ссылки лежат
 * в выдвижном меню, а тратить первый экран на служебное нельзя.
 */
function TopBar({
  locale,
  t,
  contacts,
}: {
  locale: Locale;
  t: Dictionary;
  contacts: SiteContacts;
}) {
  const address = pickI18n(contacts.address, locale);
  const hours = pickI18n(contacts.workHours, locale);

  return (
    <div className="bg-band hidden text-white/70 lg:block" data-surface="dark">
      <div className="shell text-caption flex h-10 items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {address ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="text-brand-bright size-3.5" aria-hidden="true" />
              {address}
            </span>
          ) : null}

          {hours ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="text-brand-bright size-3.5" aria-hidden="true" />
              {hours}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-5">
          {contacts.phonePrimary ? (
            <a
              href={`tel:${contacts.phonePrimary}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              <span data-numeric>{formatPhone(contacts.phonePrimary)}</span>
            </a>
          ) : null}

          {contacts.social.whatsapp ? (
            <a
              href={contacts.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <MessageCircle className="size-3.5" aria-hidden="true" />
              WhatsApp
            </a>
          ) : null}

          <Link
            href={routes.login(locale)}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <LogIn className="size-3.5" aria-hidden="true" />
            {t.topbar.portal}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({
  locale,
  t,
  contacts,
}: {
  locale: Locale;
  t: Dictionary;
  contacts: SiteContacts;
}) {
  const primaryItems = siteNavItems(locale, t, PRIMARY_NAV_KEYS);
  // В выдвижном меню показываем всё: места там достаточно.
  const allItems = siteNavItems(locale, t);

  return (
    /*
     * Служебная полоса намеренно вынесена за пределы липкого блока: если
     * прилипает всё вместе, у прокрученной страницы отъедается около
     * ста двадцати пикселей высоты. Полоса уезжает вверх и больше не
     * возвращается, а меню остаётся под рукой.
     */
    <>
      <TopBar locale={locale} t={t} contacts={contacts} />

      <header className="site-header-surface sticky top-0 z-40">
        <div className="shell flex h-18 items-center justify-between gap-4 md:h-20">
          <Link
            href={routes.home(locale)}
            className="shrink-0 rounded-full"
            aria-label={t.meta.siteNameFull}
          >
            <Wordmark name={t.meta.siteName} city={t.meta.city} />
          </Link>

          <SiteNav items={primaryItems} label={t.nav.primaryLabel} />

          <div className="flex items-center gap-1">
            {/* На 375px в строке уже нет места — язык переезжает в меню. */}
            {/* Переключателя темы здесь нет намеренно: витрина существует только
                в тёмном варианте — см. комментарий к `[data-surface="cinema"]`
                в globals.css. В админке он остался, там он к месту. */}
            <LangSwitcher current={locale} label={t.locale.switch} className="hidden sm:flex" />

            <Link
              href={routes.admission(locale)}
              className={buttonVariants({
                variant: "gold",
                size: "sm",
                className: "ml-2 hidden sm:inline-flex",
              })}
            >
              {t.nav.apply}
            </Link>

            <MobileNav
              items={allItems}
              applyHref={routes.admission(locale)}
              locale={locale}
              localeLabel={t.locale.switch}
              contacts={contacts}
              loginHref={routes.login(locale)}
              labels={{
                open: t.nav.openMenu,
                close: t.nav.closeMenu,
                apply: t.nav.apply,
                menu: t.nav.primaryLabel,
                portal: t.topbar.portal,
              }}
            />
          </div>
        </div>
      </header>
    </>
  );
}
