import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Photo } from "@/components/site/photo";
import type { NewsCard as News } from "@/lib/content/news";
import type { Locale } from "@/lib/i18n/config";
import { formatDate, formatDateParts } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Карточка новости.
 *
 * Ссылкой служит вся карточка, а не заголовок: на телефоне это разница между
 * попаданием с первого раза и промахом мимо строки текста.
 *
 * Дата подана не пилюлей с календариком поверх снимка, а датой в левом поле:
 * число крупным дисплейным начертанием, под ним месяц и год, справа
 * вертикальная линейка. Так дату ставят в газете и в дневнике. У новости
 * дата — половина смысла, а прежняя серая пилюля приравнивала её к декору;
 * иконка календаря рядом со словом «июля» к тому же не сообщала ничего.
 *
 * Две раскладки. `default` — обычная колонка. `wide` занимает две колонки и
 * разворачивается в разворот: снимок слева (или справа — сторона задаётся
 * снаружи), текст крупнее. Размер карточки говорит о весе материала раньше,
 * чем читатель дошёл до заголовка. Кадр в развороте тянется по высоте текста,
 * поэтому широкая карточка встаёт вровень с обычной соседкой и ряд не рвётся.
 */
export function NewsCard({
  item,
  locale,
  more,
  variant = "default",
  flip = false,
}: {
  item: News;
  locale: Locale;
  more: string;
  variant?: "default" | "wide";
  /** Разворот зеркалится: снимок уезжает вправо. Только для `wide`. */
  flip?: boolean;
}) {
  const wide = variant === "wide";

  return (
    <article className={cn("fx-in h-full", wide && "lg:col-span-2")}>
      <Link
        href={routes.newsItem(locale, item.slug)}
        className={cn(
          "card hover-lift group h-full overflow-hidden focus-visible:outline-offset-4",
          // Разворот без обложки разворачивать не во что: половина сетки
          // осталась бы пустой прямоугольной дырой.
          wide && item.coverUrl ? "grid lg:grid-cols-2" : "flex flex-col",
        )}
      >
        {item.coverUrl ? (
          <div
            className={cn(
              "bg-paper-sunken relative w-full overflow-hidden",
              wide
                ? ["aspect-video lg:aspect-auto lg:min-h-72", flip && "lg:order-2"]
                : "aspect-video sm:aspect-16/10",
            )}
          >
            <Photo
              src={item.coverUrl}
              alt=""
              zoom
              sizes={
                wide
                  ? "(min-width: 1024px) 40vw, 92vw"
                  : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              }
            />
          </div>
        ) : null}

        <div
          className={cn(
            "grid flex-1 grid-cols-[auto_minmax(0,1fr)] gap-x-4 sm:gap-x-5",
            wide ? "content-center p-6 md:p-9 lg:p-10" : "p-6",
          )}
        >
          <Dateline value={item.publishedAt} locale={locale} />

          {/* Линейка отделяет дату от текста и тянется на всю высоту записи —
              именно она превращает две колонки в дневниковую строку, а не
              в подпись, случайно оказавшуюся слева. */}
          <div className="border-rule flex min-w-0 flex-col border-l pl-4 sm:pl-5">
            <h3
              className={cn(
                "text-ink",
                wide ? "text-h3 lg:text-[1.75rem] lg:leading-[1.15] xl:text-[2rem]" : "text-h3",
              )}
            >
              {item.title}
            </h3>

            {item.excerpt ? (
              <p
                className={cn(
                  "text-ink-muted mt-3 flex-1",
                  wide ? "text-small lg:text-lead lg:line-clamp-none" : "text-small line-clamp-3",
                )}
              >
                {item.excerpt}
              </p>
            ) : null}

            <span
              className={cn(
                "text-small text-accent inline-flex items-center gap-1.5 font-semibold",
                wide ? "mt-6" : "mt-5",
              )}
            >
              {more}
              <ArrowRight
                className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/**
 * Дата в левом поле: крупное число, под ним месяц и год.
 *
 * Год стоит отдельной строкой и намеренно бледнее месяца. Архив новостей
 * школы живёт годами, и «29 июля» без года в нём — дата, которая врёт;
 * но в свежей ленте год не должен спорить с числом за внимание.
 *
 * Машинная дата остаётся в `datetime`, поэтому разбор на части — чисто
 * визуальный приём: ни поиск, ни скринридер от него ничего не теряют.
 */
function Dateline({ value, locale }: { value: string; locale: Locale }) {
  const parts = formatDateParts(value, locale);

  if (!parts) {
    return (
      <time dateTime={value} className="text-caption text-ink-faint" data-numeric>
        {formatDate(value, locale)}
      </time>
    );
  }

  return (
    <time dateTime={value} className="shrink-0 text-left" data-numeric>
      <span className="font-display text-ink block text-[1.75rem] leading-[0.9] font-extrabold tracking-[-0.03em] sm:text-[2rem]">
        {parts.day}
      </span>
      <span className="text-caption text-ink-muted mt-1.5 block leading-tight">{parts.month}</span>
      <span className="text-caption text-ink-faint block leading-tight">{parts.year}</span>
    </time>
  );
}
