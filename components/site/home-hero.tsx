import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import type { CSSProperties } from "react";

import { Photo } from "@/components/site/photo";
import { buttonVariants } from "@/components/ui/button";
import { pickI18n } from "@/lib/content/i18n-value";
import type { SiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES, type ImageSource } from "@/lib/content/stock-images";
import { mediaUrl } from "@/lib/content/storage";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";

/**
 * Обложка главной — кадр во весь экран.
 *
 * Фотография занимает всё окно, текст лежит поверх неё. Это и есть тот приём,
 * ради которого выбрана тёмная подача: снимок работает как кадр из фильма,
 * а не как картинка в колонке рядом с текстом.
 *
 * Читаемость держится не на плашке под текстом, а на градиентной ширме:
 * сплошной прямоугольник за буквами закрыл бы половину кадра и вернул бы
 * страницу к виду «текст слева, картинка справа».
 *
 * При прокрутке кадр медленно наезжает и гаснет — страница уходит под
 * следующий раздел. Считает это сама прокрутка (`animation-timeline: scroll()`),
 * поэтому ни одного обработчика в JS и ни одного пересчёта в главном потоке.
 */
/** Целое число без единиц — только его имеет смысл досчитывать. */
function countable(value: string): boolean {
  return /^\d{1,6}$/.test(value.trim());
}

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
   * В базе лежит путь внутри бакета, а не ссылка: смена проекта Supabase или
   * домена не должна превращать все фотографии школы в битые картинки.
   * Поэтому путь всегда прогоняется через mediaUrl — next/image принимает
   * либо абсолютный адрес, либо локальный импорт, а «site/hero.jpg» роняет
   * страницу целиком.
   */
  const heroImage: ImageSource = mediaUrl(contacts.heroImage) ?? STOCK_IMAGES.homeHero;

  return (
    <section className="relative isolate">
      {/* ---------------------------------------------------------- Кадр */}
      <div className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden sm:min-h-[92svh]">
        <div aria-hidden="true" className="fx-hero absolute inset-0 -z-20">
          <Photo src={heroImage} alt="" priority className="object-cover" sizes="100vw" />
        </div>

        {/*
         * Две ширмы вместо одной. Нижняя ведёт кадр к фону страницы, чтобы
         * обложка не обрывалась линией; левая приглушает ту половину, где
         * лежит текст, и оставляет правую почти нетронутой — лицо ребёнка
         * на снимке видно целиком.
         */}
        <div
          aria-hidden="true"
          className="from-paper via-paper/70 absolute inset-0 -z-10 bg-gradient-to-t via-35% to-transparent"
        />
        <div
          aria-hidden="true"
          className="from-paper/85 absolute inset-0 -z-10 bg-gradient-to-r to-transparent to-60%"
        />

        <div className="shell relative w-full pt-32 pb-16 md:pb-24">
          <p className="border-accent/30 bg-accent-soft text-accent text-caption fx-in mb-8 inline-flex items-center gap-2 rounded-xs border px-3 py-1.5 font-semibold">
            <span aria-hidden="true" className="bg-accent size-1.5 rounded-full" />
            {hero.badge}
          </p>

          {/*
           * Заголовок выезжает строка за строкой из-под невидимого края.
           * Каждая строка — своя пара «маска + содержимое»: маске нужен
           * overflow, иначе буквы всплывали бы в воздухе, а не появлялись.
           */}
          <h1 className="text-display max-w-5xl">
            <span className="block overflow-hidden pb-[0.12em]">
              <span className="fx-line">{hero.titleLead}</span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <span className="fx-line text-accent">{hero.titleAccent}</span>
            </span>
          </h1>

          <p className="text-lead text-ink-muted fx-in mt-8 max-w-xl">{hero.lead}</p>

          <div className="fx-in mt-10 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
            <Link
              href={routes.admission(locale)}
              className={buttonVariants({
                variant: "gold",
                size: "lg",
                className: "group btn-glow",
              })}
            >
              {hero.ctaPrimary}
              <ArrowRight
                className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            <Link
              href={routes.admission(locale)}
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              {hero.ctaSecondary}
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <p className="text-small text-ink-faint">{hero.trust}</p>

            <p className="border-rule text-small text-ink-muted flex items-center gap-2.5 border-l pl-4">
              <Award className="text-accent size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="text-ink font-semibold">{hero.plateKicker}</span>
                {" — "}
                {hero.plateText}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- Цифры */}
      {contacts.stats.length > 0 ? (
        <div className="shell">
          <dl className="border-rule grid grid-cols-2 gap-y-10 border-t py-10 md:grid-cols-4 md:py-14">
            {contacts.stats.map((stat, index) => (
              <div
                key={index}
                className="fx-in border-rule flex flex-col gap-2 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0"
              >
                <dd className="metric text-h1 text-ink leading-none" data-numeric>
                  {/*
                   * Чистое число досчитывает при прокрутке, всё остальное
                   * выводится как есть. Школа пишет в эту графу не только
                   * «128», но и «1–10» или «6.5+» — досчитать такое нельзя,
                   * а показать нужно, поэтому оживает лишь то, что оживает
                   * корректно. Разбор — на сервере, в браузер уходит готовая
                   * разметка.
                   */}
                  {countable(stat.value) ? (
                    <span
                      className="fx-counter"
                      style={{ "--to": stat.value } as CSSProperties}
                      aria-hidden="true"
                    />
                  ) : (
                    stat.value
                  )}
                  {countable(stat.value) ? <span className="sr-only">{stat.value}</span> : null}
                </dd>
                <dt className="text-small text-ink-muted">{pickI18n(stat.label, locale)}</dt>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
