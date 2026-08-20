import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { CtaBand } from "@/components/site/cta-band";
import { NewsCard } from "@/components/site/news-card";
import { VaultMark } from "@/components/site/vault-mark";
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

/**
 * Раскладка журнальной полосы: какие карточки идут разворотом в две колонки.
 *
 * Разворот можно ставить только в начало ряда. Начнись он со второй колонки —
 * в трёхколоночной сетке ему не хватит места, браузер перенесёт его целиком
 * на следующую строку, и на месте карточки останется дыра. Поэтому раскладка
 * не вычисляется по остатку от деления индекса, а проходится по ряду с учётом
 * занятых клеток.
 *
 * Второе условие — полоса обязана заканчиваться ровным рядом. Разворот
 * добавляет к общему числу клеток единицу, значит ставить его имеет смысл
 * ровно тогда, когда оставшиеся карточки без него ряд не заполняют. При числе
 * новостей, кратном трём, разворотов не будет вовсе — и это правильно:
 * три равные карточки и есть законченный ряд.
 *
 * Сторона снимка чередуется. Один и тот же разворот, повторённый трижды,
 * снова превращается в ленту; смена стороны читается как смена полосы.
 */
function spreadPlan(count: number): Map<number, "left" | "right"> {
  const plan = new Map<number, "left" | "right">();
  let column = 0;

  for (let index = 0; index < count; index += 1) {
    const remaining = count - index;
    const wide = column === 0 && remaining >= 2 && remaining % 3 !== 0;

    if (wide) plan.set(index, plan.size % 2 === 0 ? "left" : "right");
    column = (column + (wide ? 2 : 1)) % 3;
  }

  return plan;
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
   * Свежая новость подаётся во всю ширину полосой-обложкой, остальные — сеткой.
   * Лента без иерархии заставляет читателя сравнивать девять одинаковых
   * карточек; здесь глаз сразу получает точку входа, а архив остаётся рядом.
   */
  const [featured, ...rest] = news;

  const spreads = spreadPlan(rest.length);

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
                className="card hover-lift group relative block overflow-hidden focus-visible:outline-offset-4"
              >
                {featured.coverUrl ? (
                  <>
                    {/*
                     * Обложка во всю карточку, текст поверх неё — так первая
                     * полоса журнала и устроена. Высота задана минимумом,
                     * а не пропорцией: заголовок в кыргызском длиннее русского
                     * почти в полтора раза, и жёсткое 16:9 обрезало бы его.
                     */}
                    <div className="relative flex min-h-[26rem] w-full flex-col justify-end sm:min-h-[32rem] lg:min-h-[38rem]">
                      <Photo
                        src={featured.coverUrl}
                        alt=""
                        zoom
                        priority
                        sizes="(min-width: 1344px) 1216px, 100vw"
                      />

                      {/* Две шторки вместо одной: нижняя держит текст, верхняя
                          отделяет пилюлю от светлого неба на снимке. */}
                      <div
                        aria-hidden="true"
                        className="from-band via-band/55 absolute inset-0 bg-gradient-to-t to-transparent"
                      />
                      <div
                        aria-hidden="true"
                        className="from-band/50 absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent"
                      />

                      {/* Текст лежит в потоке, а не приклеен к низу абсолютом:
                          кыргызский заголовок длиннее русского почти в полтора
                          раза, и на телефоне он вырос бы вверх за пределы кадра.
                          Минимальная высота держит полосу крупной, `justify-end`
                          прижимает текст к нижнему краю, пока места хватает. */}
                      <div className="relative p-7 md:p-12 lg:p-16">
                        <div className="max-w-3xl">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="bg-accent text-caption text-band rounded-full px-3 py-1.5 font-bold">
                              {page.latest}
                            </span>

                            <time
                              dateTime={featured.publishedAt}
                              className="text-caption inline-flex items-center gap-2.5 text-white/75"
                              data-numeric
                            >
                              {/* Черта вместо календарика: иконка стояла
                                  рядом со словом «июля» и не сообщала ничего,
                                  чего не сказано текстом. */}
                              <span aria-hidden="true" className="h-px w-5 bg-white/40" />
                              {formatDate(featured.publishedAt, locale)}
                            </time>
                          </div>

                          <h2 className="text-h1 mt-5 text-white">{featured.title}</h2>

                          {featured.excerpt ? (
                            <p className="text-lead mt-4 max-w-2xl text-white/75">
                              {featured.excerpt}
                            </p>
                          ) : null}

                          <span className="text-small mt-7 inline-flex items-center gap-1.5 font-semibold text-white">
                            {t.common.more}
                            <ArrowRight
                              className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Без снимка накладывать нечего — полоса становится обычным
                     крупным блоком текста, а не карточкой с пустым местом. */
                  <div className="p-7 md:p-12 lg:p-16">
                    <div className="flex max-w-3xl flex-col">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="chip">{page.latest}</span>
                        <time
                          dateTime={featured.publishedAt}
                          className="text-caption text-ink-faint inline-flex items-center gap-2.5"
                          data-numeric
                        >
                          <span aria-hidden="true" className="bg-accent h-px w-5" />
                          {formatDate(featured.publishedAt, locale)}
                        </time>
                      </div>

                      <h2 className="text-h1 text-ink mt-5">{featured.title}</h2>

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
                  </div>
                )}
              </Link>
            </article>
          </section>

          {/* ---------------------------------------------------------- Архив */}
          {rest.length > 0 ? (
            <section className="shell section-t">
              <h2 className="text-h3 text-ink rule-b pb-5">{page.otherNews}</h2>

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((item, index) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    more={t.common.more}
                    variant={spreads.has(index) ? "wide" : "default"}
                    flip={spreads.get(index) === "right"}
                  />
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
            art={<VaultMark />}
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
