import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Photo } from "@/components/site/photo";
import type { ImageSource } from "@/lib/content/stock-images";

/**
 * Карточка ступени обучения.
 *
 * Вся карточка целиком является ссылкой: попасть по ней пальцем на телефоне
 * проще, чем по строке «подробнее» в углу.
 */
export function ProgramCard({
  grades,
  title,
  text,
  image,
  imageAlt,
  href,
  more,
}: {
  grades: string;
  title: string;
  text: string;
  image: ImageSource;
  imageAlt: string;
  href: Route;
  more: string;
}) {
  return (
    <article className="fx-in">
      <Link
        href={href}
        className="card hover-lift group flex h-full flex-col overflow-hidden focus-visible:outline-offset-4"
      >
        <div className="bg-paper-sunken relative aspect-4/3 w-full overflow-hidden">
          <Photo
            src={image}
            alt={imageAlt}
            zoom
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          />

          <span className="bg-paper-raised/95 text-caption text-accent shadow-soft absolute top-4 left-4 rounded-full px-3 py-1.5 font-bold">
            {grades}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6 md:p-7">
          <h3 className="text-h3 text-ink">{title}</h3>
          <p className="text-small text-ink-muted mt-3 flex-1">{text}</p>

          <span className="text-small text-accent mt-6 inline-flex items-center gap-1.5 font-semibold">
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
