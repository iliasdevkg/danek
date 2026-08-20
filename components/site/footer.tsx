import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { socialLinks } from "@/components/site/social-icons";
import { Wordmark } from "@/components/site/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { formatPhone, type SiteContacts } from "@/lib/content/site-settings";
import { pickI18n } from "@/lib/content/i18n-value";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes, siteNavItems } from "@/lib/routes";

export function SiteFooter({
  locale,
  t,
  contacts,
}: {
  locale: Locale;
  t: Dictionary;
  contacts: SiteContacts;
}) {
  const items = siteNavItems(locale, t);
  const address = pickI18n(contacts.address, locale);
  const workHours = pickI18n(contacts.workHours, locale);

  const socials = socialLinks(contacts);

  // Заголовок без содержимого выглядит как сломанная вёрстка, а не как «пока пусто».
  const hasContacts = Boolean(contacts.phonePrimary || contacts.email || address);

  return (
    <footer className="surface-dark mt-16 text-white sm:mt-24 md:mt-32" data-surface="dark">
      <div className="shell py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* ------------------------------------------------------- О школе */}
          <div className="col-span-2 flex flex-col gap-5 md:col-span-1 lg:col-span-4">
            <Wordmark name={t.meta.siteName} city={t.meta.city} tone="inverse" className="w-fit" />
            <p className="text-small max-w-72 text-white/60">{t.footer.about}</p>

            {socials.length > 0 ? (
              <div>
                <h2 className="text-kicker text-white/45 uppercase">{t.footer.followUs}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {socials.map((social) => (
                    <li key={social.key}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        title={social.label}
                        className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors duration-[180ms] hover:border-white/40 hover:bg-white/12 hover:text-white"
                      >
                        <social.Icon className="size-[18px]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* ------------------------------------------------------- Разделы */}
          <nav aria-label={t.footer.sections} className="col-span-2 md:col-span-1 lg:col-span-3">
            <h2 className="text-kicker text-white/45 uppercase">{t.footer.sections}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 lg:grid-cols-1">
              {items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-small text-white/65 transition-colors duration-[150ms] hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ------------------------------------------------------ Контакты */}
          <div className={hasContacts ? "lg:col-span-3" : "hidden"}>
            <h2 className="text-kicker text-white/45 uppercase">{t.nav.contacts}</h2>
            <ul className="text-small mt-4 flex flex-col gap-3.5 text-white/65">
              {contacts.phonePrimary ? (
                <li>
                  <a
                    href={`tel:${contacts.phonePrimary}`}
                    className="inline-flex items-start gap-2.5 transition-colors hover:text-white"
                  >
                    <Phone
                      className="text-brand-bright mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span data-numeric>{formatPhone(contacts.phonePrimary)}</span>
                  </a>
                </li>
              ) : null}

              {contacts.email ? (
                <li>
                  <a
                    href={`mailto:${contacts.email}`}
                    className="inline-flex items-start gap-2.5 transition-colors hover:text-white"
                  >
                    <Mail className="text-brand-bright mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {contacts.email}
                  </a>
                </li>
              ) : null}

              {address ? (
                <li className="flex items-start gap-2.5">
                  <MapPin className="text-brand-bright mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{address}</span>
                </li>
              ) : null}

              {workHours ? (
                <li className="flex items-start gap-2.5">
                  <Clock className="text-brand-bright mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{workHours}</span>
                </li>
              ) : null}
            </ul>
          </div>

          {/* ----------------------------------------------------- Родителям */}
          <div className="lg:col-span-2">
            <h2 className="text-kicker text-white/45 uppercase">{t.footer.forParents}</h2>
            <ul className="text-small mt-4 flex flex-col gap-2.5">
              <li>
                <Link
                  href={routes.login(locale)}
                  className="text-white/65 transition-colors hover:text-white"
                >
                  {t.footer.login}
                </Link>
              </li>
              <li>
                <Link
                  href={routes.admission(locale)}
                  className="text-white/65 transition-colors hover:text-white"
                >
                  {t.nav.apply}
                </Link>
              </li>
              <li>
                <Link
                  href={routes.tuition(locale)}
                  className="text-white/65 transition-colors hover:text-white"
                >
                  {t.nav.tuition}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* --------------------------------------------------- Призыв внизу */}
        <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-white/12 bg-white/5 p-6 sm:mt-14 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <p className="font-display text-h3 text-white">{t.footer.ctaTitle}</p>
            <p className="text-small mt-1.5 text-white/60">{t.footer.ctaText}</p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href={routes.admission(locale)} className={buttonVariants({ variant: "gold" })}>
              {t.nav.apply}
            </Link>

            {contacts.phonePrimary ? (
              <a
                href={`tel:${contacts.phonePrimary}`}
                className={buttonVariants({ variant: "inverse" })}
              >
                <Phone className="size-4" aria-hidden="true" />
                {t.topbar.callUs}
              </a>
            ) : null}
          </div>
        </div>

        <div className="text-caption mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-white/45 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-7">
          <p>
            © {new Date().getFullYear()} {t.meta.siteNameFull}. {t.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}
