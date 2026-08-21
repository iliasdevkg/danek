"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Photo } from "@/components/site/photo";
import { Wordmark } from "@/components/site/wordmark";
import { Button, buttonVariants } from "@/components/ui/button";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { ERROR_PAGE_STRINGS } from "@/lib/i18n/error-strings";
import { routes } from "@/lib/routes";

/**
 * Граница ошибок раздела.
 *
 * Сбой одной страницы не должен превращаться в белый экран: показываем
 * человеческий текст и кнопку повтора, а причину отправляем в логи.
 *
 * Шапки и подвала здесь нет — граница подменяет всё содержимое языкового
 * сегмента вместе с его раскладкой. Поэтому знак школы стоит в самом экране:
 * иначе страница выглядела бы чужой, и посетителю было бы некуда вернуться,
 * кроме кнопки «назад». По той же причине контент обёрнут в собственный
 * `<main>`: тот, что живёт в раскладке витрины, сюда не доезжает.
 */
export default function LocaleError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  /**
   * Next 16 отдаёт границе две функции. `reset()` только гасит состояние
   * ошибки и перерисовывает те же данные — для сбоя серверного рендера это
   * вторая попытка показать ровно тот же сломанный ответ. `retry()` сначала
   * перезапрашивает сегмент и потому действительно чинит временный сбой.
   */
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[page-error]", error.digest ?? "", error.message);
  }, [error]);

  // Язык берём из адреса: пропсов у границы ошибок нет, а показывать русский
  // текст на английской версии сайта нельзя.
  const segment = usePathname().split("/")[1];
  const locale: Locale = isLocale(segment) ? segment : DEFAULT_LOCALE;
  const t = ERROR_PAGE_STRINGS[locale];

  return (
    <div className="bg-paper-tint relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="deco-dots text-accent absolute inset-0" />

      <div className="shell relative flex flex-1 flex-col justify-center py-14 md:py-20">
        {/* Один знак без подписи: он и так узнаётся, а ссылке нужно имя,
            которое говорит, куда она ведёт, — «ДАНЕК» этого не сказал бы. */}
        <Link
          href={routes.home(locale)}
          aria-label={t.notFoundAction}
          className="self-start rounded-full transition-opacity duration-[180ms] hover:opacity-80"
        >
          <Wordmark showName={false} />
        </Link>

        <main className="mt-14 grid items-center gap-12 md:mt-16 lg:grid-cols-12 lg:gap-10">
          {/* ------------------------------------------------------------ Текст */}
          <div className="lg:col-span-6">
            <span className="icon-tile bg-gold-soft text-highlight">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>

            <h1 className="text-h1 text-ink mt-6">{t.crashTitle}</h1>
            <p className="text-lead text-ink-muted mt-5 max-w-xl">{t.crashText}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" className="group" onClick={retry}>
                {/* Стрелка проворачивается под курсором — подсказка, что кнопка
                    повторяет загрузку, а не открывает новую страницу. */}
                <RotateCcw
                  className="size-4 transition-transform duration-[420ms] ease-(--ease-entrance) group-hover:-rotate-180"
                  aria-hidden="true"
                />
                {t.crashRetry}
              </Button>

              <Link
                href={routes.home(locale)}
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                {t.notFoundAction}
              </Link>
            </div>

            {/* Код сбоя — то единственное, что помогает найти причину в логах,
                когда родитель звонит и рассказывает о «белом экране».
                Ломается по символам: длина хэша не оговорена, а на 320px
                неразрывная строка вытолкнула бы страницу за край экрана. */}
            {error.digest ? (
              <p className="text-caption text-ink-faint mt-7">
                {t.crashCode}:{" "}
                <span className="text-ink-muted font-medium break-all" data-numeric>
                  {error.digest}
                </span>
              </p>
            ) : null}
          </div>

          {/* -------------------------------------------------------- Фотография */}
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="relative mx-auto w-full max-w-60 sm:max-w-72 lg:max-w-none">
              <div aria-hidden="true" className="deco-glow absolute -inset-6 -z-10 opacity-40" />

              {/* 480px — ширина пяти колонок из двенадцати в контейнере 1280px;
                  ниже lg рамку ограничивает max-w-72. */}
              <figure className="bg-paper-sunken shadow-raised relative aspect-4/5 w-full overflow-hidden rounded-xs">
                <Photo
                  src={STOCK_IMAGES.lifeReading}
                  alt={t.crashImageAlt}
                  sizes="(min-width: 1024px) 480px, 288px"
                />
              </figure>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
