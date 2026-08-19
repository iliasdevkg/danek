import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ChevronRight } from "lucide-react";

import { CtaBand } from "@/components/site/cta-band";
import { Photo } from "@/components/site/photo";
import { buttonVariants } from "@/components/ui/button";
import { getNewsArticle, getNewsSlugs } from "@/lib/content/news";
import { getSiteContacts } from "@/lib/content/site-settings";
import { imageSourceUrl } from "@/lib/content/stock-images";
import { formatDate } from "@/lib/format";
import { LOCALES, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export const revalidate = 300;

/** Опубликованные новости пререндерятся; новые подхватит ISR при первом заходе. */
export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/news/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const article = await getNewsArticle(slug, locale);
  if (!article) return {};

  const base = pageMetadata({
    locale,
    path: `news/${slug}`,
    title: article.title,
    description: article.excerpt,
  });

  return {
    ...base,
    openGraph: {
      // Базовый блок разворачивается целиком: в нём лежат og:url и языковые
      // альтернативы. Переписать openGraph целиком — значит молча их потерять.
      ...base.openGraph,
      type: "article",
      publishedTime: article.publishedAt,
      // metadataBase из корневого layout достроит относительный путь до абсолютного.
      images: article.coverUrl ? [imageSourceUrl(article.coverUrl)] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps<"/[locale]/news/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [t, contacts, article] = await Promise.all([
    getDictionary(locale),
    getSiteContacts(),
    getNewsArticle(slug, locale),
  ]);
  if (!article) notFound();

  const page = t.newsPage;

  // Текст хранится обычными абзацами через пустую строку. Никакого HTML из базы
  // в разметку не попадает — межсайтовый скриптинг здесь невозможен.
  const paragraphs = article.body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <>
      <article>
        {/*
         * Шапка стоит на тонированной плашке, а обложка наезжает на её нижний
         * край. Так статья открывается одним кадром: дата, заголовок и снимок
         * читаются как единое целое, а не как три отдельных блока подряд.
         * Без обложки нижний отступ схлопывается — пустой плашке взяться неоткуда.
         */}
        <header
          className={cn(
            "bg-paper-tint relative overflow-hidden pt-10 md:pt-14",
            article.coverUrl ? "pb-24 md:pb-36" : "pb-12 md:pb-16",
          )}
        >
          <div aria-hidden="true" className="deco-dots text-accent absolute inset-0" />

          <div className="shell relative">
            <div className="mx-auto max-w-2xl">
              <nav aria-label={t.nav.breadcrumbLabel} className="mb-8">
                <ol className="text-caption text-ink-faint flex flex-wrap items-center gap-1.5">
                  <li>
                    <Link
                      href={routes.home(locale)}
                      className="hover:text-accent transition-colors"
                    >
                      {t.nav.home}
                    </Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight className="size-3.5" />
                  </li>
                  <li>
                    <Link
                      href={routes.news(locale)}
                      className="hover:text-accent transition-colors"
                    >
                      {t.nav.news}
                    </Link>
                  </li>
                </ol>
              </nav>

              {/* Пилюля цветом страницы, а не `chip`: на тонированной плашке
                  синяя подложка `chip` сливается с фоном. Именно `paper`, а не
                  `paper-raised`: в тёмной теме тот отличается от `paper-tint`
                  на пару единиц яркости и исчезает совсем. Рамка держит край
                  в обеих темах, где одной тени не хватает. */}
              <p className="chip border-rule text-ink shadow-soft bg-paper border">
                <CalendarDays className="text-highlight size-3.5" aria-hidden="true" />
                <span className="sr-only">{page.published}: </span>
                <time dateTime={article.publishedAt} data-numeric>
                  {formatDate(article.publishedAt, locale)}
                </time>
              </p>

              <h1 className="text-h1 text-ink mt-5">{article.title}</h1>

              {article.excerpt ? (
                <p className="text-lead text-ink-muted mt-6">{article.excerpt}</p>
              ) : null}
            </div>
          </div>
        </header>

        {article.coverUrl ? (
          <div className="shell relative -mt-16 md:-mt-24">
            <figure className="border-paper bg-paper-sunken shadow-float relative mx-auto aspect-16/9 max-w-4xl overflow-hidden rounded-2xl border-4">
              {/* Обложка — первый экран статьи и её LCP. Alt пустой намеренно:
                  снимок дублирует заголовок, стоящий строкой выше, и озвучивать
                  его второй раз скринридеру нечем. */}
              <Photo
                src={article.coverUrl}
                alt=""
                priority
                sizes="(min-width: 960px) 896px, 100vw"
              />
            </figure>
          </div>
        ) : null}

        {paragraphs.length > 0 ? (
          <div className="shell pt-12 md:pt-16">
            {/* Мера строки — те самые 68ch из токенов: читать статью в ширину
                страницы невозможно, глаз теряет начало следующей строки. */}
            <div className="mx-auto flex max-w-prose flex-col gap-5">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-body text-ink">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        <footer className="shell pt-12 md:pt-16">
          <div className="rule-t mx-auto max-w-prose pt-8">
            <Link
              href={routes.news(locale)}
              className={buttonVariants({ variant: "secondary", className: "group" })}
            >
              <ArrowLeft
                className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:-translate-x-1"
                aria-hidden="true"
              />
              {page.backToList}
            </Link>
          </div>
        </footer>
      </article>

      <CtaBand locale={locale} t={t} contacts={contacts} />
    </>
  );
}
