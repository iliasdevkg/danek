import { Photo } from "@/components/site/photo";
import { STOCK_IMAGES, type ImageSource } from "@/lib/content/stock-images";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { cn } from "@/lib/utils";

type Tile = {
  title: string;
  text: string;
  alt: string;
  image: ImageSource;
  /** Место в мозаике на широком экране. */
  area: string;
};

/**
 * Мозаика школьной жизни.
 *
 * Четыре кадра разного размера вместо ровной сетки: неравные плитки читаются
 * как живая доска с фотографиями, а не как каталог. Крупная плитка достаётся
 * питанию — это первое, о чём спрашивают родители младших классов.
 *
 * На телефоне мозаика распрямляется в колонку одинаковых карточек: на 375px
 * «крупная» плитка всё равно занимает всю ширину, и разница в размере теряет
 * смысл, а вот одинаковый ритм — нет.
 */
export function SchoolLife({ t }: { t: Dictionary }) {
  const life = t.home.life;

  const tiles: Tile[] = [
    {
      title: life.mealsTitle,
      text: life.mealsText,
      alt: life.mealsAlt,
      image: STOCK_IMAGES.lifeMeals,
      area: "lg:col-span-2 lg:row-span-2",
    },
    {
      title: life.sportTitle,
      text: life.sportText,
      alt: life.sportAlt,
      image: STOCK_IMAGES.lifeFootball,
      area: "lg:col-span-2",
    },
    {
      title: life.clubsTitle,
      text: life.clubsText,
      alt: life.clubsAlt,
      image: STOCK_IMAGES.lifeArt,
      area: "lg:col-span-1",
    },
    {
      title: life.eventsTitle,
      text: life.eventsText,
      alt: life.eventsAlt,
      image: STOCK_IMAGES.lifeCelebration,
      area: "lg:col-span-1",
    },
  ];

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:h-[36rem] lg:grid-cols-4 lg:grid-rows-2">
      {tiles.map((tile) => (
        <article
          key={tile.title}
          className={cn(
            "fx-in group bg-paper-sunken shadow-card relative overflow-hidden rounded-2xl",
            /*
             * `w-full` здесь обязателен, а не для красоты.
             *
             * Пара `aspect-ratio` + `min-height` без заданной ширины считается
             * в обратную сторону: браузер берёт минимальную высоту, умножает на
             * соотношение и получает ШИРИНУ — 16rem × 4/3 = 341px, что шире
             * всей колонки на телефоне в 320px. Плитка вылезала за экран и
             * тянула за собой горизонтальную прокрутку всей страницы.
             * Явная ширина делает её определённой, и соотношение считает уже
             * высоту, как и задумано.
             */
            "aspect-4/3 w-full min-w-0 sm:aspect-auto sm:min-h-72 lg:aspect-auto lg:min-h-0",
            tile.area,
          )}
        >
          <Photo
            src={tile.image}
            alt={tile.alt}
            zoom
            sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 92vw"
          />

          {/* Затемнение снизу: подпись обязана читаться на любом кадре,
              включая светлое фото еды. Градиент, а не сплошная плашка —
              верх фотографии остаётся чистым. */}
          <div
            aria-hidden="true"
            className="from-band via-band/45 absolute inset-0 bg-gradient-to-t to-transparent"
          />

          {/*
           * Пояснение видно всегда, а не раскрывается по наведению.
           *
           * Раскрытие выглядело эффектно, но стоило дорого во всех смыслах:
           * оно росло через max-height — свойство раскладки, то есть каждый
           * кадр наведения заставлял браузер пересчитывать геометрию плитки,
           * — и при этом было полностью недоступно с телефона, где наведения
           * не существует. Ради анимации, которую увидит меньшая часть
           * посетителей, прятать от большей то, ради чего она сюда смотрит,
           * — плохой размен. Плитки увеличены, текст помещается целиком.
           */}
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <h3 className="text-h3 text-white">{tile.title}</h3>
            <p className="text-small mt-2 max-w-md text-white/75">{tile.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
