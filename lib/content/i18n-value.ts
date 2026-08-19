import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { I18nText } from "@/lib/supabase/database.types";

export const EMPTY_I18N: I18nText = { ky: "", ru: "", en: "" };

/**
 * Достаёт текст на нужном языке с откатом.
 *
 * Школа заполняет карточки постепенно: русский есть всегда, кыргызский и
 * английский догоняют. Пустая строка на странице — хуже, чем текст на соседнем
 * языке, поэтому порядок отката: свой → русский → любой заполненный.
 */
export function pickI18n(value: I18nText | null | undefined, locale: Locale): string {
  if (!value) return "";

  const own = value[locale]?.trim();
  if (own) return own;

  const fallback = value[DEFAULT_LOCALE]?.trim();
  if (fallback) return fallback;

  return (
    Object.values(value)
      .find((v) => v?.trim())
      ?.trim() ?? ""
  );
}

/** Есть ли вообще что показывать — чтобы не рисовать пустой блок с заголовком. */
export function hasI18n(value: I18nText | null | undefined): boolean {
  return Boolean(value && Object.values(value).some((v) => v?.trim()));
}
