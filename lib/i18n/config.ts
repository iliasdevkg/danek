import type { Route } from "next";

export const LOCALES = ["ky", "ru", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * Родители в Бишкеке читают маркетинговые страницы по-русски — с него и начинаем.
 * Меняется одной строкой, остальной код читает только эту константу.
 */
export const DEFAULT_LOCALE: Locale = "ru";

/** Как язык называет сам себя — в переключателе никогда не переводим. */
export const LOCALE_LABELS: Record<Locale, string> = {
  ky: "Кыргызча",
  ru: "Русский",
  en: "English",
};

/** Короткая подпись для узкого мобильного переключателя. */
export const LOCALE_SHORT: Record<Locale, string> = {
  ky: "KG",
  ru: "RU",
  en: "EN",
};

/** Значение атрибута lang: региональный тег помогает переносам и озвучке. */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  ky: "ky-KG",
  ru: "ru-KG",
  en: "en",
};

/** Теги для hreflang и OpenGraph. */
export const LOCALE_OG_TAG: Record<Locale, string> = {
  ky: "ky_KG",
  ru: "ru_KG",
  en: "en_US",
};

export const LOCALE_COOKIE = "danek-locale";

/** Год держим сколько живёт учебный цикл — язык выбирают один раз. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Разбор Accept-Language с учётом q-весов.
 * `ky-KG,ky;q=0.9,ru;q=0.8` → ky. Неизвестные языки игнорируются,
 * при полном промахе возвращается локаль по умолчанию.
 */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      const quality = q === undefined ? 1 : Number.parseFloat(q);
      return {
        base: tag.trim().toLowerCase().split("-")[0],
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const entry of ranked) {
    if (isLocale(entry.base)) return entry.base;
  }

  return DEFAULT_LOCALE;
}

/** Явный выбор пользователя всегда важнее заголовков браузера. */
export function resolveLocale(
  cookieValue: string | undefined | null,
  acceptLanguage: string | null,
): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  return localeFromAcceptLanguage(acceptLanguage);
}

/** Подменяет языковой сегмент в пути, сохраняя остальной маршрут. */
export function localizePathname(pathname: string, locale: Locale): Route {
  const segments = pathname.split("/");
  // segments[0] всегда пустая строка — путь начинается со слэша.
  if (isLocale(segments[1])) {
    segments[1] = locale;
    return segments.join("/") as Route;
  }
  return `/${locale}${pathname === "/" ? "" : pathname}` as Route;
}
