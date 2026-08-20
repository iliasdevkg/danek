import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";

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

  /*
   * Текст хранится обычными абзацами через пустую строку. Никакого HTML из базы
   * в разметку не попадает — межсайтовый скриптинг здесь невозможен.
   *
   * Единственная разметка, которую понимает редактор, — угловая скобка в начале
   * абзаца: такой абзац выносится из колонки крупной цитатой. Приём взят
   * из почтовых цитат и из markdown, то есть уже знаком тому, кто пишет
   * новости, и не требует ни редактора, ни отдельного поля в базе.
   */
  const blocks = article.body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block.startsWith(">")
        ? ({ kind: "quote", text: block.replace(/^>\s?/gm, "").trim() } as const)
        : ({ kind: "text", text: block } as const),
    );

  return (
    <>
      {/*
       * Таймлайн объявлен на всей статье, а не на колонке текста. У короткой
       * новости колонка ниже экрана, и диапазон `contain` для неё сводится
       * к паре сотен пикселей: полоса дозаполнялась бы к середине страницы.
       * Статья целиком — вместе с шапкой, обложкой и ссылкой назад — всегда
       * выше экрана, и её `contain` это ровно путь от начала до конца чтения.
       * Приглашение и подвал в таймлайн не входят намеренно: они уже не статья.
       */}
      <article className="fx-read-track">
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
              {/* Дата статьи набрана строкой с чертой, а не пилюлей с
                  календариком: пилюля выглядела ярлыком, приклеенным к тексту,
                  а дата у новости — часть самой новости. Тот же приём стоит
                  на карточках в ленте, так что переход со списка в статью
                  не меняет интонацию. */}
              <p className="text-caption text-ink-muted inline-flex items-center gap-3">
                <span aria-hidden="true" className="bg-accent h-px w-6" />
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
          /* Обложка шире колонки текста и шире прежних 896 пикселей: это первый
             кадр статьи, и он должен работать разворотом, а не иллюстрацией
             к абзацу. На телефоне пропорция ниже — 16:9 там уже почти полоска. */
          <div className="shell relative -mt-16 md:-mt-24">
            <figure className="border-paper bg-paper-sunken shadow-float relative mx-auto aspect-4/3 max-w-5xl overflow-hidden rounded-2xl border-4 sm:aspect-16/9">
              {/* Обложка — первый экран статьи и её LCP. Alt пустой намеренно:
                  снимок дублирует заголовок, стоящий строкой выше, и озвучивать
                  его второй раз скринридеру нечем. */}
              <Photo
                src={article.coverUrl}
                alt=""
                priority
                sizes="(min-width: 1088px) 1024px, 100vw"
              />
            </figure>
          </div>
        ) : null}

        {blocks.length > 0 ? (
          <div className="shell pt-12 md:pt-16">
            {/* Полоса дочитанного прилипает к нижнему краю шапки, а не к верху
                экрана: у верха уже живёт волосяная линия общей прокрутки, и две
                полосы друг на друге читались бы как сбой. Ширина полосы —
                чистый scaleX по таймлайну прокрутки, ни одного обработчика. */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-x-0 top-18 z-40 h-[3px] md:top-20"
            >
              <div className="bg-accent fx-read h-full w-full" />
            </div>

            {/* Мера строки — те самые 68ch из токенов: читать статью в ширину
                страницы невозможно, глаз теряет начало следующей строки. */}
            <div className="mx-auto flex max-w-prose flex-col gap-5">
              {blocks.map((block, index) =>
                block.kind === "quote" ? (
                  /*
                   * Цитата выходит за колонку влево и набрана дисплейным
                   * шрифтом: она обязана читаться как остановка в тексте,
                   * а не как ещё один абзац покрупнее. Кавычки рисует
                   * базовый стиль `q` по языку страницы — «ёлочки» для ru/ky,
                   * “лапки” для en.
                   */
                  <figure key={index} className="my-4 lg:-ml-16">
                    <blockquote className="border-gold text-ink border-l-4 pl-6 md:pl-8">
                      <p className="font-display text-[clamp(1.25rem,1rem+1.1vw,1.75rem)] leading-[1.3] font-bold tracking-[-0.02em]">
                        <q>{block.text}</q>
                      </p>
                    </blockquote>
                  </figure>
                ) : (
                  <p key={index} className="text-body text-ink">
                    {block.text}
                  </p>
                ),
              )}
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
