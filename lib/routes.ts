import type { Route } from "next";

import type { Locale } from "./i18n/config";
import type { Dictionary } from "./i18n/dictionaries/ru";

/** Ключ пункта меню совпадает с ключом в словаре — рассинхрон невозможен. */
export const SITE_NAV_KEYS = [
  "about",
  "programs",
  "teachers",
  "admission",
  "tuition",
  "news",
  "gallery",
  "contacts",
] as const;

export type SiteNavKey = (typeof SITE_NAV_KEYS)[number];

/**
 * Верхнее меню намеренно короче полного списка.
 *
 * Родитель приходит за шестью вещами: что за школа, чему учат, кто учит,
 * как поступить, сколько стоит, как доехать. Новости и галерея живут в
 * подвале, на главной и в мобильном меню — в шапке они только растягивали
 * строку до переполнения на ноутбуке.
 */
export const PRIMARY_NAV_KEYS = [
  "about",
  "programs",
  "teachers",
  "admission",
  "tuition",
  "contacts",
] as const satisfies readonly SiteNavKey[];

export type NavItem = {
  key: SiteNavKey;
  /** Типизированный маршрут: несуществующая ссылка падает на сборке. */
  href: Route;
  label: string;
};

export function siteNavItems(
  locale: Locale,
  t: Dictionary,
  keys: readonly SiteNavKey[] = SITE_NAV_KEYS,
): NavItem[] {
  return keys.map((key) => ({
    key,
    href: `/${locale}/${key}` as Route,
    label: t.nav[key],
  }));
}

export const routes = {
  home: (locale: Locale) => `/${locale}` as Route,
  about: (locale: Locale) => `/${locale}/about` as Route,
  programs: (locale: Locale) => `/${locale}/programs` as Route,
  teachers: (locale: Locale) => `/${locale}/teachers` as Route,
  admission: (locale: Locale) => `/${locale}/admission` as Route,
  tuition: (locale: Locale) => `/${locale}/tuition` as Route,
  news: (locale: Locale) => `/${locale}/news` as Route,
  newsItem: (locale: Locale, slug: string) => `/${locale}/news/${slug}` as Route,
  gallery: (locale: Locale) => `/${locale}/gallery` as Route,
  contacts: (locale: Locale) => `/${locale}/contacts` as Route,
  login: (locale: Locale) => `/${locale}/login` as Route,

  crm: (locale: Locale) => `/${locale}/crm` as Route,
  crmApplications: (locale: Locale, openId?: string) =>
    (openId
      ? `/${locale}/crm/applications?open=${openId}`
      : `/${locale}/crm/applications`) as Route,
  crmStudents: (locale: Locale) => `/${locale}/crm/students` as Route,
  crmStudent: (locale: Locale, id: string) => `/${locale}/crm/students/${id}` as Route,
  crmClasses: (locale: Locale) => `/${locale}/crm/classes` as Route,
  crmClass: (locale: Locale, id: string) => `/${locale}/crm/classes/${id}` as Route,
  crmTeachers: (locale: Locale) => `/${locale}/crm/teachers` as Route,
  crmSettings: (locale: Locale) => `/${locale}/crm/settings` as Route,
} as const;
