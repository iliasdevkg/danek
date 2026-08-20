import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { notFound } from "next/navigation";

import "@/app/globals.css";

import { isDemoContent } from "@/lib/content/demo";

import { LOCALES, LOCALE_HTML_LANG, LOCALE_OG_TAG, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SITE_URL, THEME_STORAGE_KEY, canonicalUrl } from "@/lib/site";

/*
 * Шрифты: самохост, только нужные наборы символов и только те начертания,
 * которые действительно встречаются в вёрстке.
 *
 * cyrillic-ext обязателен — кыргызские ң, ө, ү живут именно там, и без него
 * три буквы в каждом втором слове проваливались бы в системный фолбэк.
 *
 * Начертания перечислены явно, а не взяты переменным файлом: переменный шрифт
 * с кириллицей тянет весь диапазон от тонкого до чёрного и весит под сотню
 * килобайт. Нам нужны три веса текстового и два заголовочного, и статические
 * файлы дают ту же картинку в разы легче. Для мобильного интернета в Бишкеке
 * это решающая разница.
 *
 * Manrope держит заголовки: геометричный гротеск с мягкими окончаниями —
 * строгий, как положено школе, и при этом не сухой. Кириллица у него
 * нарисована, а не механически доведена, поэтому «ДАНЕК» крупным кеглем
 * выглядит так же уверенно, как латиница.
 */
const sans = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

/*
 * У заголовочного шрифта `optional`, а не `swap`, и это не придирка.
 *
 * Метрики запасного начертания Next.js подгоняет автоматически, но подогнать
 * ширину букв нельзя: тот же заголовок в системном шрифте переносится
 * по-другому. На заголовке в шесть десятков пикселей лишний перенос стоит
 * целой строки — около сотни пикселей, на которые в момент подмены прыгает
 * вся страница. CLS уходил за 0.14 при пороге 0.1.
 *
 * `optional` снимает подмену вовсе: шрифт предзагружен и почти всегда успевает
 * к первой отрисовке, а если не успел на совсем медленной сети — страница
 * останется в запасном начертании и не дёрнется ни разу. Текстовый шрифт
 * ниже держит `swap`: там кегль мелкий, и перенос строки почти не меняется.
 */
const display = Manrope({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["700", "800"],
  variable: "--font-manrope",
  display: "optional",
  preload: true,
});

/** Три локали пререндерятся на сборке — дальше их раздаёт CDN. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#08122a" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t.meta.siteNameFull} — ${t.meta.tagline}`,
      template: `%s · ${t.meta.siteName}`,
    },
    description: t.meta.description,
    applicationName: t.meta.siteName,
    alternates: {
      canonical: canonicalUrl(locale),
      languages: {
        ky: canonicalUrl("ky"),
        ru: canonicalUrl("ru"),
        en: canonicalUrl("en"),
        "x-default": canonicalUrl("ru"),
      },
    },
    openGraph: {
      type: "website",
      siteName: t.meta.siteNameFull,
      title: `${t.meta.siteNameFull} — ${t.meta.tagline}`,
      description: t.meta.description,
      url: canonicalUrl(locale),
      locale: LOCALE_OG_TAG[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_OG_TAG[l]),
    },
    twitter: { card: "summary_large_image" },
    /*
     * robots.txt можно не прочитать, а мета-тег робот видит на самой странице —
     * поэтому запрет на демо-режим стоит в обоих местах. Условие одно и то же
     * (см. app/robots.ts): вымышленные педагоги и отзывы не должны попасть
     * в выдачу как сведения о настоящей школе.
     */
    robots: isDemoContent
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
  };
}

/*
 * Тема проставляется до первой отрисовки, иначе тёмная тема мигнула бы белым.
 * Скрипт намеренно крошечный и синхронный — это единственный блокирующий JS
 * на публичных страницах.
 */
const themeScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;

  return (
    <html
      lang={LOCALE_HTML_LANG[typedLocale]}
      data-theme="light"
      className={`${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/*
         * Скрипт темы приходит сырой разметкой, а не элементом <script>.
         *
         * Разница неочевидная, но важная. React 19 отказывается выполнять
         * <script>, созданный на клиенте, и предупреждает об этом в консоли.
         * На первой отрисовке это безобидно — там работает серверный рендер,
         * — но при смене языка маршрут пересобирается целиком, React заново
         * создаёт всё дерево документа и натыкается на тег, который заведомо
         * не сработает. Предупреждение честное: такой <script> действительно
         * бесполезен, тема к тому моменту давно проставлена.
         *
         * Строка внутри dangerouslySetInnerHTML уходит в поток ответа как
         * есть, поэтому браузер разбирает её обычным парсером и выполняет
         * синхронно — ровно то поведение, ради которого скрипт здесь и стоит.
         * При повторной отрисовке на клиенте React просто перезапишет
         * innerHTML, и по спецификации HTML такой скрипт не выполнится:
         * ни предупреждения, ни лишней работы.
         *
         * Место — первый узел <body>: разметки до него нет, поэтому браузеру
         * нечего успеть нарисовать светлой темой, пока скрипт не отработал.
         */}
        <div hidden dangerouslySetInnerHTML={{ __html: `<script>${themeScript}</script>` }} />
        {children}
      </body>
    </html>
  );
}
