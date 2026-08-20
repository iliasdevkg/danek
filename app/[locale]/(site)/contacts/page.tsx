import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { ApplyForm } from "@/components/site/apply-form";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeader } from "@/components/site/section-header";
import { socialLinks } from "@/components/site/social-icons";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { pickI18n } from "@/lib/content/i18n-value";
import { formatPhone, getSiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contacts">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: "contacts",
    title: t.contactsPage.title,
    description: t.contactsPage.lead,
  });
}

export default async function ContactsPage({ params }: PageProps<"/[locale]/contacts">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, contacts] = await Promise.all([getDictionary(locale), getSiteContacts()]);
  const page = t.contactsPage;

  const address = pickI18n(contacts.address, locale);
  const hours = pickI18n(contacts.workHours, locale);
  // Основной и дополнительные номера лежат в разных полях настроек, и один
  // и тот же номер легко попадает в оба. Set убирает дубль: иначе в списке
  // окажутся две одинаковые строки и два одинаковых ключа в React.
  const phones = [
    ...new Set(
      [contacts.phonePrimary, ...contacts.phonesExtra].filter((phone): phone is string =>
        Boolean(phone),
      ),
    ),
  ];
  const socials = socialLinks(contacts);

  // Каждая карточка ждёт своих данных, поэтому колонка может остаться пустой
  // целиком — на этот случай вместо неё встаёт объяснение, а не белое место.
  const hasAnyContact =
    phones.length > 0 ||
    Boolean(contacts.email) ||
    Boolean(address) ||
    Boolean(hours) ||
    socials.length > 0;

  // Ссылку строим по координатам, а не по адресу строкой: на телефоне её
  // перехватит установленное приложение карт и сразу построит маршрут.
  // Координат нет — карты на странице нет вовсе: точка «примерно там» хуже,
  // чем её отсутствие.
  const mapHref = contacts.map
    ? `https://www.google.com/maps/search/?api=1&query=${contacts.map.lat},${contacts.map.lng}`
    : null;

  return (
    <>
      <PageHero
        locale={locale}
        t={t}
        kicker={page.kicker}
        title={page.title}
        lead={page.lead}
        image={STOCK_IMAGES.aboutCampus}
        imageAlt={page.imageAlt}
      />

      {/* ---------------------------------------------- Связаться и написать */}
      <section className="shell section-t">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            {hasAnyContact ? (
              // На узком экране карточки идут в две колонки: четыре способа
              // связи не должны превращаться в километровый столбик, а в
              // колонке рядом с формой каждая карточка получает всю ширину.
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {phones.length > 0 ? (
                  <li className="card fx-in p-6">
                    <span className="icon-tile">
                      <Phone className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="text-kicker text-ink-faint mt-5 uppercase">{page.phoneTitle}</h2>

                    <ul className="mt-1.5 flex flex-col gap-1">
                      {phones.map((phone) => (
                        <li key={phone}>
                          <a
                            href={`tel:${phone}`}
                            className="font-display text-h3 text-ink hover:text-accent transition-colors duration-[180ms]"
                            data-numeric
                          >
                            {formatPhone(phone)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : null}

                {contacts.email ? (
                  <li className="card fx-in p-6">
                    <span className="icon-tile">
                      <Mail className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="text-kicker text-ink-faint mt-5 uppercase">{page.emailTitle}</h2>

                    <a
                      href={`mailto:${contacts.email}`}
                      className="text-body text-ink hover:text-accent mt-1.5 block break-all transition-colors duration-[180ms]"
                    >
                      {contacts.email}
                    </a>
                  </li>
                ) : null}

                {address ? (
                  <li className="card fx-in p-6">
                    <span className="icon-tile">
                      <MapPin className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="text-kicker text-ink-faint mt-5 uppercase">
                      {page.addressTitle}
                    </h2>
                    <p className="text-body text-ink mt-1.5">{address}</p>
                  </li>
                ) : null}

                {hours ? (
                  <li className="card fx-in p-6">
                    <span className="icon-tile">
                      <Clock className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="text-kicker text-ink-faint mt-5 uppercase">{page.hoursTitle}</h2>
                    <p className="text-body text-ink mt-1.5">{hours}</p>
                  </li>
                ) : null}

                {socials.length > 0 ? (
                  <li className="card fx-in p-6 sm:col-span-2 lg:col-span-1">
                    <h2 className="text-kicker text-ink-faint uppercase">{page.socialTitle}</h2>

                    <ul className="mt-4 flex flex-wrap gap-2.5">
                      {socials.map((social) => (
                        <li key={social.key}>
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({ variant: "secondary", size: "sm" })}
                          >
                            <social.Icon className="size-4" />
                            {social.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : null}
              </ul>
            ) : (
              <EmptyState
                icon={<MapPin className="size-8" aria-hidden="true" />}
                title={t.common.empty}
                description={page.empty}
              />
            )}
          </div>

          {/*
           * Форма стоит рядом с контактами, а не под ними: родитель, который
           * не станет звонить, должен видеть второй путь сразу, без прокрутки.
           * Панель отделяет её от списка способов связи — это предмет, а не
           * продолжение колонки.
           */}
          <div className="lg:col-span-7">
            <div className="card shadow-raised p-6 sm:p-8 md:p-10">
              <SectionHeader
                kicker={t.admission.formKicker}
                title={t.admission.formTitle}
                lead={t.admission.formLead}
              />

              <div className="mt-8">
                <ApplyForm locale={locale} t={t} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- Карта */}
      {mapHref ? (
        <section className="shell section-t">
          <div className="card fx-in flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-10 md:p-10">
            <div className="flex gap-5">
              <span className="icon-tile">
                <MapPin className="size-5" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <h2 className="text-h3 text-ink">{page.mapTitle}</h2>
                <p className="text-small text-ink-muted mt-2">{page.mapText}</p>
              </div>
            </div>

            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "secondary", className: "shrink-0" })}
            >
              {page.mapCta}
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------------------- Приглашение */}
      <CtaBand locale={locale} t={t} contacts={contacts} />
    </>
  );
}
