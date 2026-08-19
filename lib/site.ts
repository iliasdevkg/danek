import type { Locale } from "./i18n/config";

/**
 * Базовый адрес сайта. Нужен для canonical, hreflang, sitemap и OG-картинок —
 * без него поисковик индексирует превью-домены Vercel вместо школы.
 */
export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
})();

export const SCHOOL = {
  /** Юридическое имя для JSON-LD и подвала. Источник: @danek.uvk в Instagram. */
  legalName: "ДАНЕК",
  /** Официальный статус — учебно-воспитательный комплекс, не просто «школа». */
  legalForm: "УВК",
  city: "Бишкек",
  country: "KG",
  timeZone: "Asia/Bishkek",
  currency: "KGS",
  /**
   * Классы, которые реально ведёт УВК на сегодня.
   *
   * В шапке профиля @danek.uvk указано «1–9 классы», но объявления о наборе
   * говорят о приёме с 1 по 10 класс и отдельно — в 8–10. Берём более широкий
   * диапазон: он совпадает с тем, что школа сейчас набирает. Значение стоит
   * подтвердить у школы — от него зависят и список классов в форме заявки,
   * и тексты на витрине.
   */
  gradeFrom: 1,
  gradeTo: 10,
  instagramHandle: "danek.uvk",
  instagramUrl: "https://www.instagram.com/danek.uvk/",
  whatsappGroupUrl: "https://chat.whatsapp.com/Ll0HdV0ng7I1bq7PDW0h78",
} as const;

export const THEME_STORAGE_KEY = "danek-theme";

export type ThemePreference = "light" | "dark" | "system";

export function canonicalUrl(locale: Locale, pathname = ""): string {
  const clean = pathname.replace(/^\/+/, "");
  return `${SITE_URL}/${locale}${clean ? `/${clean}` : ""}`;
}
