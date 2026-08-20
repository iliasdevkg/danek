import { Photo } from "@/components/site/photo";
import { STOCK_IMAGES, type ImageSource } from "@/lib/content/stock-images";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

type Frame = { title: string; text: string; alt: string; image: ImageSource };

/**
 * Школьная жизнь — горизонтальная лента, которую двигает вертикальная прокрутка.
 *
 * Раньше здесь была мозаика из четырёх плиток. Она работала, но оставалась
 * ещё одной сеткой карточек на странице, где их и без того много. Лента
 * читается иначе: кадр за кадром, как проход по школе, и держит внимание,
 * пока прокрутка идёт вниз, а картинка идёт вбок.
 *
 * Ни одного обработчика прокрутки: внешний блок объявляет именованный
 * таймлайн, лента к нему привязана, движение считает браузер в композиторе.
 * Где scroll-driven не поддержан, лента остаётся обычной горизонтальной
 * прокруткой пальцем — приём деградирует в свою же честную основу.
 *
 * На телефоне высокий блок с приклеенным кадром неуместен: там лента просто
 * листается пальцем, а вертикальная прокрутка остаётся вертикальной.
 */
export function SchoolLife({ t }: { t: Dictionary }) {
  const life = t.home.life;

  const frames: Frame[] = [
    {
      title: life.mealsTitle,
      text: life.mealsText,
      alt: life.mealsAlt,
      image: STOCK_IMAGES.lifeMeals,
    },
    {
      title: life.sportTitle,
      text: life.sportText,
      alt: life.sportAlt,
      image: STOCK_IMAGES.lifeFootball,
    },
    {
      title: life.clubsTitle,
      text: life.clubsText,
      alt: life.clubsAlt,
      image: STOCK_IMAGES.lifeArt,
    },
    {
      title: life.eventsTitle,
      text: life.eventsText,
      alt: life.eventsAlt,
      image: STOCK_IMAGES.lifeCelebration,
    },
    {
      title: life.sportTitle,
      text: life.sportText,
      alt: life.sportAlt,
      image: STOCK_IMAGES.lifeBasketball,
    },
    {
      title: life.clubsTitle,
      text: life.clubsText,
      alt: life.clubsAlt,
      image: STOCK_IMAGES.lifeReading,
    },
  ];

  return (
    <>
      {/* Телефон и планшет: обычная лента, листается пальцем. */}
      <div className="mt-10 lg:hidden">
        <ul className="app-scroll -mx-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-5 pb-4">
          {frames.slice(0, 4).map((frame, index) => (
            <li key={index} className="w-[78vw] shrink-0 snap-start sm:w-[52vw]">
              <FrameCard frame={frame} />
            </li>
          ))}
        </ul>
      </div>

      {/* Десктоп: высокий блок, приклеенный кадр, лента едет вбок. */}
      <div className="fx-strip mt-12 hidden h-[320vh] lg:block">
        <div className="sticky top-0 flex h-svh items-center overflow-hidden">
          <ul className="fx-track gap-6 px-[max(2rem,calc((100vw-1280px)/2))]">
            {frames.map((frame, index) => (
              <li key={index} className="w-[34vw] max-w-[30rem] shrink-0">
                <FrameCard frame={frame} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function FrameCard({ frame }: { frame: Frame }) {
  return (
    <figure className="group bg-paper-sunken relative aspect-4/5 w-full overflow-hidden rounded-xs">
      <Photo
        src={frame.image}
        alt={frame.alt}
        zoom
        sizes="(min-width: 1024px) 34vw, (min-width: 640px) 52vw, 78vw"
      />

      {/* Затемнение снизу: подпись обязана читаться на любом кадре, включая
          светлое фото еды. Градиент, а не плашка — верх снимка остаётся чистым. */}
      <div
        aria-hidden="true"
        className="from-band via-band/40 absolute inset-0 bg-gradient-to-t to-transparent"
      />

      <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <h3 className="text-h3 text-white">{frame.title}</h3>
        <p className="text-small mt-2 text-white/70">{frame.text}</p>
      </figcaption>
    </figure>
  );
}
