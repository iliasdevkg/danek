import type { MetadataRoute } from "next";

import { getNewsSlugs } from "@/lib/content/news";
import { LOCALES } from "@/lib/i18n/config";
import { SITE_NAV_KEYS } from "@/lib/routes";
import { canonicalUrl } from "@/lib/site";

export const revalidate = 3600;

/**
 * Карта сайта со связкой языковых версий.
 *
 * У каждой записи перечислены альтернативы на трёх языках — так поисковик
 * понимает, что это одна страница на разных языках, а не три конкурента.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getNewsSlugs();
  const paths = ["", ...SITE_NAV_KEYS, ...slugs.map((slug) => `news/${slug}`)];

  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: canonicalUrl(locale, path),
      lastModified: new Date(),
      changeFrequency: path.startsWith("news") ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "admission" ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, canonicalUrl(l, path)])),
      },
    })),
  );
}
