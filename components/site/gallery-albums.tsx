"use client";

import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useCallback, useState } from "react";

import { Photo } from "@/components/site/photo";
import { Kicker } from "@/components/site/section-header";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { GalleryAlbum } from "@/lib/content/gallery";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Position = { album: number; photo: number };

/** Мелкая плитка мозаики: четверть ряда на десктопе, половина — на телефоне. */
const THUMB_SIZES = "(min-width: 1024px) 300px, (min-width: 640px) 31vw, 45vw";

/**
 * Альбомы с просмотром на весь экран.
 *
 * Клиентским здесь стал только просмотрщик — сама сетка приезжает с сервера
 * готовой разметкой, поэтому фотографии видны и проиндексированы даже до того,
 * как загрузится хоть один килобайт скриптов.
 *
 * Раскладка альбома — бенто, а не ровный квадратный ковёр: первый кадр занимает
 * четыре клетки и работает обложкой (на нём же счётчик снимков), остальные идут
 * мелкой мозаикой. Ровная сетка из шестнадцати одинаковых квадратов читается
 * как выгрузка из папки; неравные плитки задают точку входа и порядок чтения.
 */
export function GalleryAlbums({
  albums,
  locale,
  labels,
}: {
  albums: GalleryAlbum[];
  locale: Locale;
  labels: {
    photosCount: string;
    /** Форма для одной фотографии: по-английски «1 photos» — просто ошибка. */
    photosCountOne: string;
    close: string;
    previous: string;
    next: string;
  };
}) {
  /*
   * Два состояния вместо одного, и это не небрежность.
   *
   * Если хранить только `Position | null` и снимать её при закрытии, то
   * `<DialogContent>` пропадает из дерева в том же кадре, в котором Radix
   * ставит `data-state="closed"`, — и анимация ухода не успевает проиграть
   * ни разу: окно не закрывается, а исчезает. Позиция поэтому переживает
   * закрытие, а видимостью управляет отдельный флаг; размонтирует поддерево
   * сам Radix, когда анимация доиграет.
   */
  const [position, setPosition] = useState<Position | null>(null);
  const [open, setOpen] = useState(false);

  const current = position ? albums[position.album]?.photos[position.photo] : null;
  const currentAlbum = position ? albums[position.album] : null;
  const caption = current?.alt.trim() ?? "";

  const move = useCallback(
    (delta: number) => {
      setPosition((at) => {
        if (!at) return at;
        const photos = albums[at.album]?.photos ?? [];
        if (photos.length === 0) return at;

        // По кругу: с последнего снимка стрелка вправо возвращает к первому.
        const next = (at.photo + delta + photos.length) % photos.length;
        return { ...at, photo: next };
      });
    },
    [albums],
  );

  return (
    <>
      <div className="flex flex-col gap-16 md:gap-24">
        {albums.map((album, albumIndex) => {
          const headingId = `gallery-album-${album.id}`;
          const count = album.photos.length;

          /*
           * Обложка занимает четыре клетки — но только когда есть чем занять
           * соседние. Плитка 2×2 съедает ровно два ряда, поэтому ей нужно
           * столько соседей, сколько остаётся клеток в этих двух рядах:
           * двое при трёх колонках и четверо при четырёх. Не хватило — рядом
           * с обложкой открывается пустой прямоугольник, и раскладка читается
           * как недогрузившаяся.
           *
           * Отсюда три режима: до двух колонок обложка крупная от трёх
           * снимков, при трёх колонках — тоже от трёх, при четырёх — от пяти.
           * Одиночный снимок — случай особый: на телефоне он занимает обе
           * колонки (ставить рядом всё равно нечего), дальше становится
           * обычной плиткой.
           */
          const coverSpan = cn(
            count === 1 && "col-span-2 sm:col-span-1",
            count >= 3 && "col-span-2 row-span-2",
            count <= 4 && "lg:col-span-1 lg:row-span-1",
          );

          // sizes обязан повторять ту же развилку: иначе браузер качает кадр
          // на 620 пикселей туда, где плитка ужалась до трёхсот.
          const coverSizes = [
            count >= 5 ? "(min-width: 1024px) 620px" : "(min-width: 1024px) 300px",
            count >= 3 ? "(min-width: 640px) 64vw" : "(min-width: 640px) 31vw",
            count === 2 ? "45vw" : "92vw",
          ].join(", ");

          return (
            <section key={album.id} aria-labelledby={headingId}>
              <header className="max-w-2xl">
                {album.happenedOn ? (
                  <Kicker>
                    <time dateTime={album.happenedOn}>{formatDate(album.happenedOn, locale)}</time>
                  </Kicker>
                ) : null}

                <h2 id={headingId} className={cn("text-h2 text-ink", album.happenedOn && "mt-4")}>
                  {album.title}
                </h2>

                {album.description ? (
                  <p className="text-lead text-ink-muted mt-3">{album.description}</p>
                ) : null}
              </header>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-10 md:gap-4 lg:grid-cols-4">
                {album.photos.map((photo, photoIndex) => {
                  // Мелкие плитки квадратные, поэтому высота обложки совпадает
                  // с двумя рядами мозаики без единого числа в разметке.
                  const isCover = photoIndex === 0;

                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => {
                        setPosition({ album: albumIndex, photo: photoIndex });
                        setOpen(true);
                      }}
                      className={cn(
                        "card group relative aspect-square overflow-hidden",
                        "focus-visible:outline-offset-4",
                        isCover
                          ? ["hover-lift", coverSpan]
                          : [
                              "fx-in",
                              "transition-[border-color,box-shadow] duration-[240ms] ease-(--ease-entrance)",
                              "hover:border-rule-strong hover:shadow-card",
                            ],
                      )}
                    >
                      <Photo
                        src={photo.url}
                        // Единственное содержимое кнопки — снимок, поэтому её
                        // доступное имя целиком берётся из alt. В базе колонка
                        // alt по умолчанию пустая, и без отката скринридер
                        // прочитал бы весь альбом как ряд безымянных «кнопок».
                        alt={photo.alt.trim() || album.title}
                        zoom
                        sizes={isCover ? coverSizes : THUMB_SIZES}
                      />

                      {isCover ? (
                        <span className="chip shadow-soft absolute top-4 left-4" data-numeric>
                          <Images className="size-3.5" aria-hidden="true" />
                          {(count === 1 ? labels.photosCountOne : labels.photosCount).replace(
                            "{n}",
                            String(count),
                          )}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        {current && currentAlbum ? (
          <DialogContent
            closeLabel={labels.close}
            // Стрелки работают сразу после открытия: фокус уже внутри окна.
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") move(-1);
              if (event.key === "ArrowRight") move(1);
            }}
            /* Подпись под кадром служит описанием окна. Alt в базе не
               обязателен: когда его нет, описания у окна нет вовсе — и это
               надо сказать Radix явно, иначе он оставит aria-describedby
               висеть на несуществующем узле. */
            {...(caption ? {} : { "aria-describedby": undefined })}
            className="w-[calc(100vw-1.5rem)] max-w-[min(76rem,calc(100vw-1.5rem))] rounded-2xl p-3 sm:p-4"
          >
            {/* Заголовок видимый, а не только для скринридера: в просмотрщике
                легко забыть, какой альбом открыт, — снимки похожи друг на друга.
                Отступ справа оставлен под крестик закрытия. */}
            <DialogTitle className="min-w-0 truncate pr-12 pl-1">{currentAlbum.title}</DialogTitle>

            {/* Тёмная рамка: поля вокруг вертикального кадра не должны быть
                белыми — иначе снимок выглядит вырезанным из страницы.
                data-surface переводит кольцо фокуса стрелок в золото. */}
            <div className="bg-band relative mt-3 overflow-hidden rounded-xl" data-surface="dark">
              {/* Ограничение по высоте важнее пропорции: в альбомном режиме
                  на телефоне кадр 16:10 иначе не помещается и окно уезжает
                  в прокрутку. */}
              <div className="relative aspect-4/3 max-h-[68dvh] w-full sm:aspect-16/10">
                <Photo
                  key={current.id}
                  src={current.url}
                  alt={caption || currentAlbum.title}
                  sizes="(min-width: 1216px) 1152px, 100vw"
                  className="animate-[fade-in_200ms_var(--ease-entrance)_both] object-contain"
                />
              </div>

              {currentAlbum.photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => move(-1)}
                    aria-label={labels.previous}
                    className={cn(
                      "absolute top-1/2 left-2 grid size-10 -translate-y-1/2 place-items-center sm:left-4 sm:size-11",
                      "bg-band/70 rounded-full border border-white/25 text-white backdrop-blur-sm",
                      "transition duration-[150ms] ease-(--ease-standard)",
                      "hover:bg-band hover:border-white/50 active:scale-95",
                    )}
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => move(1)}
                    aria-label={labels.next}
                    className={cn(
                      "absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center sm:right-4 sm:size-11",
                      "bg-band/70 rounded-full border border-white/25 text-white backdrop-blur-sm",
                      "transition duration-[150ms] ease-(--ease-standard)",
                      "hover:bg-band hover:border-white/50 active:scale-95",
                    )}
                  >
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>

            {/* Строки под кадром может не быть вовсе: у одиночного снимка без
                подписи считать нечего и показывать нечего — пустой отступ
                читался бы как оборванная вёрстка. */}
            {caption || currentAlbum.photos.length > 1 ? (
              <div
                className={cn(
                  "mt-3 flex items-center gap-4 px-1",
                  caption ? "justify-between" : "justify-end",
                )}
              >
                {caption ? (
                  <DialogDescription className="min-w-0 truncate">{caption}</DialogDescription>
                ) : null}

                {currentAlbum.photos.length > 1 ? (
                  <p className="text-caption text-ink-faint shrink-0 tabular-nums">
                    {(position?.photo ?? 0) + 1} / {currentAlbum.photos.length}
                  </p>
                ) : null}
              </div>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
