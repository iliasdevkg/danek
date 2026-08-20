import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";

import { CtaBand } from "@/components/site/cta-band";
import { NewsCard } from "@/components/site/news-card";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublishedNews } from "@/lib/content/news";
import { getSiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { formatDate } from "@/lib/format";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Новости обновляются чаще остального сайта. */
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/[locale]/news">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: "news",
    title: t.newsPage.title,
    description: t.newsPage.lead,
  });
}

export default async function NewsPage({ params }: PageProps<"/[locale]/news">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, contacts, news] = await Promise.all([
    getDictionary(locale),
    getSiteContacts(),
    getPublishedNews(locale),
  ]);

  const page = t.newsPage;

  /*
   * Свежая новость подаётся крупно, остальные — сеткой.
   * Лента без иерархии заставляет читателя сравнивать девять одинаковых
   * карточек; здесь глаз сразу получает точку входа, а архив остаётся рядом.
   */
  const [featured, ...rest] = news;

  return (
    <>
      <PageHero
        locale={locale}
        t={t}
        kicker={page.kicker}
        title={page.title}
        lead={page.lead}
        image={STOCK_IMAGES.lifeCelebration}
        imageAlt={page.heroImageAlt}
      />

      {news.length > 0 ? (
        <>
          {/* --------------------------------------------------- Свежая новость */}
          <section className="shell section-t">
            <article>
              <Link
                href={routes.newsItem(locale, featured.slug)}
                className="card hover-lift group grid overflow-hidden focus-visible:outline-offset-4 lg:grid-cols-12"
              >
                {featured.coverUrl ? (
                  /* На широком экране колонка тянется по высоте текста, поэтому
                     соотношение сторон снимается, а минимум держит кадр
                     достаточно крупным даже у короткой новости. */
                  <div className="bg-paper-sunken relative aspect-16/10 w-full overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-96">
                    {/* Колонка — ровно семь двенадцатых ширины `shell`, а та
                        упирается в 1280px. Без первого условия браузер на
                        широком мониторе просил бы вдвое более тяжёлый кадр. */}
                    <Photo
                      src={featured.coverUrl}
                      alt=""
                      zoom
                      priority
                      sizes="(min-width: 1344px) 709px, (min-width: 1024px) 55vw, 100vw"
                    />
                  </div>
                ) : null}

                <div
                  className={cn(
                    "flex flex-col justify-center p-7 md:p-10",
                    featured.coverUrl ? "lg:col-span-5" : "lg:col-span-12 lg:max-w-3xl",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="chip">{page.latest}</span>

                    <time
                      dateTime={featured.publishedAt}
                      className="text-caption text-ink-faint inline-flex items-center gap-1.5"
                      data-numeric
                    >
                      <CalendarDays className="text-highlight size-3.5" aria-hidden="true" />
                      {formatDate(featured.publishedAt, locale)}
                    </time>
                  </div>

                  <h2 className="text-h2 text-ink mt-5">{featured.title}</h2>

                  {featured.excerpt ? (
                    <p className="text-lead text-ink-muted mt-4">{featured.excerpt}</p>
                  ) : null}

                  <span className="text-small text-accent mt-7 inline-flex items-center gap-1.5 font-semibold">
                    {t.common.more}
                    <ArrowRight
                      className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </article>
          </section>

          {/* ---------------------------------------------------------- Архив */}
          {rest.length > 0 ? (
            <section className="shell section-t">
              <h2 className="text-h3 text-ink rule-b pb-5">{page.otherNews}</h2>

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((item) => (
                  <NewsCard key={item.id} item={item} locale={locale} more={t.common.more} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        /* Новости школа публикует сама через CRM, и до первой публикации
           раздел пуст. Пустой экран уводит туда, где жизнь школы уже видна, —
           в галерею, а не в тупик. */
        <section className="shell section-t">
          <EmptyState
            icon={<Newspaper className="size-7" aria-hidden="true" />}
            title={page.emptyTitle}
            description={page.empty}
            action={
              <Link
                href={routes.gallery(locale)}
                className={buttonVariants({ variant: "secondary" })}
              >
                {t.nav.gallery}
              </Link>
            }
          />
        </section>
      )}

      <CtaBand
        locale={locale}
        t={t}
        contacts={contacts}
        title={page.ctaTitle}
        text={page.ctaText}
      />
    </>
  );
}
