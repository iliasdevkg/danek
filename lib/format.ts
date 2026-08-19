import type { Locale } from "./i18n/config";
import { SCHOOL } from "./site";

const INTL_LOCALE: Record<Locale, string> = {
  ky: "ky-KG",
  ru: "ru-RU",
  en: "en-GB",
};

/**
 * Дата в местном формате и в часовом поясе Бишкека.
 *
 * Пояс задан явно: сервер Vercel живёт в UTC, и без него новость, вышедшая
 * первого сентября в 02:00 по Бишкеку, показалась бы датированной августом.
 */
export function formatDate(value: string | Date, locale: Locale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: SCHOOL.timeZone,
  }).format(date);
}

export function formatDateTime(value: string | Date, locale: Locale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SCHOOL.timeZone,
  }).format(date);
}

/** Сумма в сомах без копеек: школа не выставляет счета с копейками. */
export function formatMoney(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: SCHOOL.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
