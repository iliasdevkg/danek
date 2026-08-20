import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { Photo } from "@/components/site/photo";
import type { NewsCard as News } from "@/lib/content/news";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";

/**
 * Карточка новости.
 *
 * Ссылкой служит вся карточка, а не заголовок: на телефоне это разница между
 * попаданием с первого раза и промахом мимо строки текста. Дата вынесена
 * на обложку — в сетке из трёх колонок так она не съедает высоту у заголовка.
 */
export function NewsCard({ item, locale, more }: { item: News; locale: Locale; more: string }) {
  return (
    <article className="fx-in h-full">
      <Link
        href={routes.newsItem(locale, item.slug)}
        className="card hover-lift group flex h-full flex-col overflow-hidden focus-visible:outline-offset-4"
      >
        {item.coverUrl ? (
          <div className="bg-paper-sunken relative aspect-16/10 w-full overflow-hidden">
            <Photo
              src={item.coverUrl}
              alt=""
              zoom
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            />

            <time
              dateTime={item.publishedAt}
              className="bg-paper-raised/95 text-caption text-ink shadow-soft absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold"
              data-numeric
            >
              <CalendarDays className="text-highlight size-3.5" aria-hidden="true" />
              {formatDate(item.publishedAt, locale)}
            </time>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col p-6">
          {/* Без обложки дата должна быть видна всё равно — иначе новость
              выглядит как заметка без времени. */}
          {item.coverUrl ? null : (
            <time
              dateTime={item.publishedAt}
              className="text-caption text-ink-faint mb-3 inline-flex items-center gap-1.5"
              data-numeric
            >
              <CalendarDays className="text-highlight size-3.5" aria-hidden="true" />
              {formatDate(item.publishedAt, locale)}
            </time>
          )}

          <h3 className="text-h3 text-ink">{item.title}</h3>

          {item.excerpt ? (
            <p className="text-small text-ink-muted mt-3 line-clamp-3 flex-1">{item.excerpt}</p>
          ) : null}

          <span className="text-small text-accent mt-5 inline-flex items-center gap-1.5 font-semibold">
            {more}
            <ArrowRight
              className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
