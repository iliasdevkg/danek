import type { MetadataRoute } from "next";

import { isDemoContent } from "@/lib/content/demo";
import { SITE_URL } from "@/lib/site";

/**
 * Правила для поисковых роботов.
 *
 * Пока сайт работает на демонстрационном наборе — то есть школа ещё не
 * подключила базу, — индексировать его нельзя ни одной страницей. В демо
 * стоят вымышленные имена педагогов, придуманные отзывы родителей и новости;
 * попади они в выдачу, родитель прочитал бы их как сведения о настоящей школе.
 *
 * Поэтому запрет висит не на конкретном стенде, а на самом факте демо-режима:
 * как только в окружении появятся ключи Supabase и сайт начнёт отдавать
 * данные школы, индексация включится сама, без правки этого файла и без
 * шанса забыть её вернуть.
 */
export default function robots(): MetadataRoute.Robots {
  if (isDemoContent) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Всё, что за логином, индексировать нечего: там всё равно редирект.
      disallow: ["/*/crm", "/*/parent", "/*/student", "/*/login", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
