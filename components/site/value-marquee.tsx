import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * Бегущая строка с тем, чем школа отличается.
 *
 * Приём из журнальной обложки: набор коротких формул, которые читаются
 * боковым зрением и складываются в образ. Здесь он делает работу разделителя
 * между разделами — но, в отличие от линейки, ещё и несёт содержание.
 *
 * Список продублирован в разметке, а анимация сдвигает дорожку ровно на
 * половину её ширины: в момент, когда первая копия уходит за край, вторая
 * стоит на её месте пиксель в пиксель, и цикл замыкается без рывка.
 * Дубль скрыт от скринридера — читать один и тот же список дважды незачем.
 *
 * Движение — чистый transform, то есть работа композитора: строка не мешает
 * прокрутке и не заставляет браузер пересчитывать раскладку ни разу.
 */
export function ValueMarquee({ t }: { t: Dictionary }) {
  const v = t.home.values;

  const values = [
    v.englishFirst,
    v.strongMath,
    v.meals,
    v.ielts,
    v.arabic,
    v.ort,
    v.finance,
    v.ethics,
    v.olympiads,
    v.sport,
  ];

  return (
    <section
      className="marquee-host surface-dark relative overflow-hidden py-5"
      data-surface="dark"
      aria-label={t.home.features.kicker}
    >
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? "true" : undefined}
            className="flex shrink-0 items-center"
          >
            {values.map((value) => (
              <li
                key={value}
                className="font-display text-lead flex shrink-0 items-center gap-8 px-8 font-bold whitespace-nowrap text-white"
              >
                {value}
                <span aria-hidden="true" className="bg-gold size-1.5 shrink-0 rounded-full" />
              </li>
            ))}
          </ul>
        ))}
      </div>

      {/* Края растворяются в фоне — строка выглядит бесконечной, а не обрезанной. */}
      <div
        aria-hidden="true"
        className="from-band pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent md:w-28"
      />
      <div
        aria-hidden="true"
        className="from-band pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l to-transparent md:w-28"
      />
    </section>
  );
}
