import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Photo } from "@/components/site/photo";
import { Kicker } from "@/components/site/section-header";
import type { ImageSource } from "@/lib/content/stock-images";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Шапка внутренней страницы — кадр, а не полоса.
 *
 * Раньше все разделы открывались одинаковым текстовым блоком на плоской
 * подложке. Рядом с обложкой главной, где фотография занимает весь экран,
 * это читалось как обрыв: будто внутренние страницы делал кто-то другой.
 * Теперь у каждого раздела свой кадр во всю ширину, и переход с главной
 * не спотыкается.
 *
 * Снимок не обязателен: без него остаётся прежняя тёмная плашка, только
 * с крупным заголовком. Это нужно тем разделам, где картинка была бы
 * украшением — например, где сразу под шапкой идёт своя большая фотография.
 */
export function PageHero({
  locale,
  t,
  kicker,
  title,
  lead,
  aside,
  image,
  imageAlt = "",
}: {
  locale: Locale;
  t: Dictionary;
  kicker: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
  image?: ImageSource;
  imageAlt?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      {image ? (
        <>
          {/* Кадр медленно наезжает, пока читатель уходит вниз, — тот же приём,
              что на обложке главной, только короче ходом. */}
          <div
            aria-hidden={imageAlt ? undefined : "true"}
            className="fx-hero absolute inset-0 -z-20"
          >
            <Photo src={image} alt={imageAlt} priority sizes="100vw" />
          </div>

          {/* Две ширмы: нижняя сводит кадр к фону страницы, левая приглушает
              ту половину, где лежит текст. Сплошная плашка закрыла бы снимок. */}
          <div
            aria-hidden="true"
            className="from-paper via-paper/75 absolute inset-0 -z-10 bg-gradient-to-t via-45% to-transparent"
          />
          <div
            aria-hidden="true"
            className="from-paper/90 absolute inset-0 -z-10 bg-gradient-to-r to-transparent to-70%"
          />
        </>
      ) : (
        <div aria-hidden="true" className="bg-paper-tint absolute inset-0 -z-10" />
      )}

      <div
        className={cn(
          "shell relative grid gap-10 lg:grid-cols-12",
          image ? "pt-24 pb-16 md:pt-36 md:pb-24" : "py-14 md:py-20",
        )}
      >
        <div className="lg:col-span-8">
          <nav aria-label={t.nav.breadcrumbLabel} className="mb-7">
            <ol className="text-caption text-ink-faint flex flex-wrap items-center gap-1.5">
              <li>
                <Link href={routes.home(locale)} className="hover:text-accent transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="text-ink-muted font-medium" aria-current="page">
                {title}
              </li>
            </ol>
          </nav>

          <Kicker>{kicker}</Kicker>

          {/* Заголовок выезжает из-под невидимого края: маске нужен overflow,
              иначе строка всплывала бы в воздухе, а не появлялась. */}
          <h1 className="text-h1 text-ink mt-5 overflow-hidden">
            <span className="fx-line">{title}</span>
          </h1>

          {lead ? <p className="text-lead text-ink-muted fx-in mt-6 max-w-2xl">{lead}</p> : null}
        </div>

        {aside ? <div className="lg:col-span-3 lg:col-start-10 lg:self-end">{aside}</div> : null}
      </div>
    </section>
  );
}
