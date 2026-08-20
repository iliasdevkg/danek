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

/**
 * Дата, разобранная на части, — для типографической подачи.
 *
 * Число и месяц приходят отдельными строками, потому что в вёрстке они живут
 * порознь: крупное число и мелкое название под ним. Месяц запрашивается сам
 * по себе намеренно — в паре с числом русский Intl отдаёт родительный падеж
 * («июля»), а отдельно стоящему слову нужен именительный («июль»).
 *
 * Порядок частей в разных языках разный (по-кыргызски год идёт первым), но
 * здесь это не имеет значения: порядок задаёт вёрстка, а не локаль.
 */
export function formatDateParts(
  value: string | Date,
  locale: Locale,
): { day: string; month: string; year: string } | null {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;

  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      ...options,
      timeZone: SCHOOL.timeZone,
    }).format(date);

  return {
    day: part({ day: "numeric" }),
    month: part({ month: "long" }),
    year: part({ year: "numeric" }),
  };
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
