import { pickI18n } from "@/lib/content/i18n-value";
import type { SiteContacts } from "@/lib/content/site-settings";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { SCHOOL, canonicalUrl } from "@/lib/site";

/**
 * Структурированные данные о школе.
 *
 * Благодаря им Google показывает в выдаче карточку организации с адресом и
 * телефоном, а не просто синюю ссылку. Пустые поля не выводим: неполная
 * разметка хуже её отсутствия — поисковик перестаёт доверять всей карточке.
 */
export function SchoolJsonLd({
  locale,
  t,
  contacts,
}: {
  locale: Locale;
  t: Dictionary;
  contacts: SiteContacts;
}) {
  const address = pickI18n(contacts.address, locale);

  const sameAs = [
    contacts.social.instagram,
    contacts.social.facebook,
    contacts.social.telegram,
  ].filter(Boolean);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "School",
    name: t.meta.siteNameFull,
    alternateName: SCHOOL.legalName,
    description: t.meta.description,
    url: canonicalUrl(locale),
    inLanguage: ["ky", "ru", "en"],
    areaServed: SCHOOL.city,
  };

  if (contacts.phonePrimary) data.telephone = contacts.phonePrimary;
  if (contacts.email) data.email = contacts.email;
  if (sameAs.length > 0) data.sameAs = sameAs;

  if (address) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: SCHOOL.city,
      addressCountry: SCHOOL.country,
    };
  }

  if (contacts.map) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: contacts.map.lat,
      longitude: contacts.map.lng,
    };
  }

  return (
    <script
      type="application/ld+json"
      // Данные собраны на сервере из своей же базы, произвольной разметки здесь нет.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
