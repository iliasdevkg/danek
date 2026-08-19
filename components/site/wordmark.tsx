import { cn } from "@/lib/utils";

/**
 * Знак и название школы.
 *
 * Эмблема набрана вектором, а не картинкой: она нужна в шапке, подвале и на
 * тёмной плашке, где нужен другой цвет, — растр пришлось бы держать в трёх
 * вариантах и грузить отдельным запросом. Здесь это часть HTML, она приходит
 * с первым байтом и масштабируется без пикселей.
 *
 * Мотив взят с эмблемы @danek.uvk: росток, вписанный в круг. Два листа —
 * ребёнок и школа рядом; вертикаль между ними — путь, по которому он растёт.
 */
export function Wordmark({
  name,
  city,
  className,
  tone = "default",
  showName = true,
}: {
  /** Название школы из словаря. Не нужно, когда подпись выключена. */
  name?: string;
  /**
   * Город под названием. Приходит из словаря, а не зашит в разметку:
   * на английской версии сайта под знаком должно стоять Bishkek, а не Бишкек.
   */
  city?: string;
  className?: string;
  /** На синей плашке знак и текст идут белым. */
  tone?: "default" | "inverse";
  showName?: boolean;
}) {
  const inverse = tone === "inverse";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-[240ms]",
          inverse ? "bg-white/12" : "bg-accent",
        )}
      >
        <svg viewBox="0 0 32 32" className="size-6" fill="none" aria-hidden="true">
          {/* Стебель: путь снизу вверх. */}
          <path
            d="M16 26V13"
            stroke={inverse ? "#ffffff" : "var(--brand-bright)"}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Левый лист — ребёнок. */}
          <path
            d="M16 15.5C16 15.5 9.5 15 7.5 10.5C11.8 8.8 16 11.4 16 15.5Z"
            fill={inverse ? "#ffffff" : "var(--brand-bright)"}
          />
          {/* Правый лист — школа, крупнее и выше: она подхватывает. */}
          <path
            d="M16 16.5C16 16.5 16.6 8 22.5 5C25.2 10.4 21.6 16.1 16 16.5Z"
            fill={inverse ? "#ffffff" : "#ffffff"}
            opacity={inverse ? 0.75 : 1}
          />
        </svg>
      </span>

      {showName && name ? (
        <span className="inline-flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.0625rem] font-extrabold tracking-[0.16em]",
              inverse ? "text-white" : "text-ink",
            )}
          >
            {name}
          </span>
          {city ? (
            <span
              className={cn(
                "mt-1 text-[0.5625rem] font-semibold tracking-[0.22em] uppercase",
                inverse ? "text-white/60" : "text-ink-faint",
              )}
            >
              {city}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
