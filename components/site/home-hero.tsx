import Link from "next/link";
import { ArrowRight, Award, Play } from "lucide-react";

import { Photo } from "@/components/site/photo";
import { buttonVariants } from "@/components/ui/button";
import { pickI18n } from "@/lib/content/i18n-value";
import type { SiteContacts } from "@/lib/content/site-settings";
import { mediaUrl } from "@/lib/content/storage";
import { STOCK_IMAGES, type ImageSource } from "@/lib/content/stock-images";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";

/**
 * Обложка главной.
 *
 * Заголовок — текст, а не картинка: он и есть LCP-элемент страницы и
 * появляется сразу после первого байта CSS, не дожидаясь ни одной фотографии.
 *
 * Появление блоков разведено по времени вручную, а не через scroll-driven
 * анимацию: обложка уже в кадре при загрузке, и «появление при прокрутке»
 * для неё отработало бы мгновенно и вхолостую. Задержки в миллисекундах —
 * ровно тот каскад, за которым глаз успевает пройти сверху вниз.
 */
export function HomeHero({
  locale,
  t,
  contacts,
}: {
  locale: Locale;
  t: Dictionary;
  contacts: SiteContacts;
}) {
  const hero = t.home.hero;
  /*
   * В настройках лежит путь внутри бакета, а не готовая ссылка — mediaUrl
   * достраивает её до адреса хранилища. Без этого шага next/image получал
   * строку «site/hero-classroom.jpg» и падал: относительный путь обязан
   * начинаться со слэша.
   */
  const heroImage: ImageSource = mediaUrl(contacts.heroImage) ?? STOCK_IMAGES.homeHero;

  return (
    <section className="relative overflow-hidden pb-20 md:pb-28">
      {/* Тёплая подложка за обложкой: она отделяет первый экран от остальной
          страницы мягче, чем линейка, и не добавляет ни одного элемента в DOM. */}
      <div aria-hidden="true" className="bg-paper-tint absolute inset-x-0 top-0 -z-10 h-[78%]" />
      <div
        aria-hidden="true"
        className="deco-dots text-accent absolute inset-x-0 top-0 -z-10 h-[78%]"
      />

      <div className="shell grid items-center gap-12 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-20">
        {/* ------------------------------------------------------------ Текст */}
        <div className="lg:col-span-6">
          <p
            className="border-gold/35 bg-gold-soft text-caption text-highlight inline-flex animate-[rise_600ms_var(--ease-entrance)_both] items-center gap-2 rounded-full border px-3.5 py-1.5 font-semibold"
            style={{ animationDelay: "40ms" }}
          >
            <span aria-hidden="true" className="bg-gold size-1.5 rounded-full" />
            {hero.badge}
          </p>

          <h1
            className="text-display text-ink mt-6 animate-[rise_600ms_var(--ease-entrance)_both]"
            style={{ animationDelay: "110ms" }}
          >
            {hero.titleLead}{" "}
            {/* Акцентное слово подчёркнуто золотой волной — приём вынесен в
                псевдоэлемент, чтобы подчёркивание тянулось за переносом строки. */}
            <span className="text-accent relative whitespace-nowrap">
              {hero.titleAccent}
              <span
                aria-hidden="true"
                className="bg-gold/45 absolute inset-x-0 -bottom-1 h-2.5 rounded-full md:-bottom-2 md:h-3.5"
              />
            </span>
          </h1>

          <p
            className="text-lead text-ink-muted mt-7 max-w-xl animate-[rise_600ms_var(--ease-entrance)_both]"
            style={{ animationDelay: "180ms" }}
          >
            {hero.lead}
          </p>

          <div
            className="mt-9 flex animate-[rise_600ms_var(--ease-entrance)_both] flex-wrap gap-3"
            style={{ animationDelay: "250ms" }}
          >
            <Link
              href={routes.admission(locale)}
              className={buttonVariants({ variant: "gold", size: "lg", className: "group" })}
            >
              {hero.ctaPrimary}
              {/* Стрелка подаётся вперёд под курсором: движение подсказывает,
                  что ссылка ведёт дальше, а не открывает диалог. */}
              <ArrowRight
                className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            <Link
              href={routes.admission(locale)}
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <Play className="size-4" aria-hidden="true" />
              {hero.ctaSecondary}
            </Link>
          </div>

          <p
            className="text-small text-ink-faint mt-7 animate-[fade-in_600ms_var(--ease-entrance)_both]"
            style={{ animationDelay: "330ms" }}
          >
            {hero.trust}
          </p>
        </div>

        {/* ------------------------------------------------------ Фотография */}
        <div className="lg:col-span-6 lg:pl-6">
          <div
            className="relative mx-auto max-w-md animate-[rise_800ms_var(--ease-entrance)_both] lg:mr-0 lg:max-w-none"
            style={{ animationDelay: "150ms" }}
          >
            {/* Зелёное свечение за аркой — глубина без второй фотографии. */}
            <div aria-hidden="true" className="deco-glow absolute -inset-6 -z-10 opacity-40" />

            <figure className="arch bg-paper-sunken shadow-float relative aspect-4/5 w-full">
              <Photo
                src={heroImage}
                alt={hero.imageAlt}
                priority
                sizes="(min-width: 1024px) 46vw, (min-width: 640px) 60vw, 90vw"
              />
            </figure>

            {/* Плашка с результатом. Она перекрывает угол фотографии — это и
                делает композицию объёмной, а не «картинка в рамке». */}
            <div className="card shadow-float absolute -bottom-6 -left-4 flex max-w-[17rem] items-start gap-3 p-4 md:-left-8 md:p-5">
              <span className="icon-tile bg-gold-soft text-highlight size-11">
                <Award className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="text-caption text-ink-faint block font-semibold tracking-wide uppercase">
                  {hero.plateKicker}
                </span>
                <span className="text-small text-ink mt-1 block font-semibold">
                  {hero.plateText}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- Цифры */}
      {contacts.stats.length > 0 ? (
        <div className="shell mt-20 md:mt-24">
          <dl className="card shadow-raised grid grid-cols-2 gap-y-8 p-7 md:grid-cols-4 md:p-9">
            {contacts.stats.map((stat, index) => (
              <div
                key={index}
                className="md:border-rule flex flex-col gap-1.5 px-2 text-center md:border-r md:last:border-r-0"
              >
                <dd className="font-display text-h1 text-accent order-1 leading-none" data-numeric>
                  {stat.value}
                </dd>
                <dt className="text-small text-ink-muted order-2">
                  {pickI18n(stat.label, locale)}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
