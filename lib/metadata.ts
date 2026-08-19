import type { Metadata } from "next";

import { LOCALE_OG_TAG, LOCALES, type Locale } from "@/lib/i18n/config";
import { canonicalUrl } from "@/lib/site";

/**
 * Метаданные внутренней страницы.
 *
 * Собраны в одном месте, потому что hreflang легко сделать наполовину:
 * canonical поставить, а языковые альтернативы забыть — и три версии страницы
 * начинают конкурировать друг с другом в выдаче.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  /** Путь без языкового префикса, например "admission". */
  path: string;
  title: string;
  description?: string;
}): Metadata {
  const url = canonicalUrl(locale, path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ky: canonicalUrl("ky", path),
        ru: canonicalUrl("ru", path),
        en: canonicalUrl("en", path),
        "x-default": canonicalUrl("ru", path),
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      locale: LOCALE_OG_TAG[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_OG_TAG[l]),
    },
  };
}
