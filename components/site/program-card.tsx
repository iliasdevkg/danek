import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Photo } from "@/components/site/photo";
import type { ImageSource } from "@/lib/content/stock-images";
import { cn } from "@/lib/utils";

/**
 * Карточка ступени обучения.
 *
 * Вся карточка целиком является ссылкой: попасть по ней пальцем на телефоне
 * проще, чем по строке «подробнее» в углу.
 *
 * Две раскладки. `grid` — обычная колонка в сетке из трёх. `wide` — широкая
 * строка с кадром слева: она нужна там, где карточки идут стопкой во всю
 * ширину, потому что вертикальная карточка, растянутая на 1280 пикселей,
 * превращается в фотографию высотой в экран с подписью под ней.
 */
export function ProgramCard({
  grades,
  title,
  text,
  image,
  imageAlt,
  href,
  more,
  layout = "grid",
}: {
  grades: string;
  title: string;
  text: string;
  image: ImageSource;
  imageAlt: string;
  href: Route;
  more: string;
  layout?: "grid" | "wide";
}) {
  const wide = layout === "wide";

  return (
    <article className={cn(!wide && "fx-in")}>
      <Link
        href={href}
        className={cn(
          "card hover-lift group overflow-hidden focus-visible:outline-offset-4",
          wide ? "grid lg:grid-cols-2" : "flex h-full flex-col",
        )}
      >
        <div
          className={cn(
            "bg-paper-sunken relative w-full overflow-hidden",
            wide
              ? "aspect-2/1 sm:aspect-video lg:aspect-auto lg:min-h-[26rem]"
              : "aspect-video sm:aspect-4/3",
          )}
        >
          <Photo
            src={image}
            alt={imageAlt}
            zoom
            sizes={
              wide
                ? "(min-width: 1024px) 50vw, 92vw"
                : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            }
          />

          <span className="bg-paper/90 text-caption text-accent absolute top-4 left-4 rounded-xs px-3 py-1.5 font-bold backdrop-blur-sm">
            {grades}
          </span>
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col",
            wide ? "justify-center p-6 sm:p-8 lg:p-12" : "p-6 md:p-7",
          )}
        >
          <h3 className={cn("text-ink", wide ? "text-h3 sm:text-h2" : "text-h3")}>{title}</h3>
          <p
            className={cn(
              "text-ink-muted mt-3 flex-1",
              wide ? "text-small sm:text-lead max-w-md" : "text-small",
            )}
          >
            {text}
          </p>

          <span className="text-small text-accent mt-4 inline-flex items-center gap-1.5 font-semibold sm:mt-6">
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
