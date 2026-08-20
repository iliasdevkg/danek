import { cn } from "@/lib/utils";

/**
 * «Свод из огней» — иллюстрация для пустых разделов витрины.
 *
 * Земля, арка от края до края и семь огней на ней. Арка — форма с эмблемы
 * школы, та же, в которой стоят портреты педагогов; огни — дети, каждый
 * отдельный; земля — то общее, на чём всё держится. Раздел, где пока нет
 * ни одной новости, говорит этим рисунком «содержимого нет, а школа есть».
 *
 * Рисунок декоративный: `aria-hidden` стоит намеренно. Пустое состояние
 * рядом уже объясняет словами, почему здесь пусто и что делать дальше, и
 * второй голос, пересказывающий картинку, только удлинил бы прослушивание.
 *
 * Ни одного цвета в разметке — только переменные витрины. Правка палитры
 * в globals.css доедет сюда сама. Анимация и вся геометрия расписаны там же,
 * в блоке `.vault-*`.
 */
export function VaultMark({
  className,
  reveal = "load",
}: {
  className?: string;
  /**
   * Когда проигрывать.
   *
   * `load` — один прогон при загрузке. Годится вверху страницы, где рисунок
   * заведомо на экране: в пустом разделе. `scroll` — прогресс задаёт сама
   * прокрутка; нужен внизу страницы, куда родитель доберётся много позже
   * загрузки и застал бы уже доигравшую анимацию.
   */
  reveal?: "load" | "scroll";
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={cn("size-32 sm:size-40", reveal === "scroll" && "vault-scroll", className)}
    >
      <path
        className="vault-ground"
        d="M12 76 H88"
        stroke="var(--rule-strong)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Две половины, а не одна дуга: свет расходится от вершины в обе
          стороны одновременно, и каждая половина чертится от неё. */}
      <path
        className="vault-half"
        d="M50 40 A36 36 0 0 0 14 76"
        stroke="var(--ink-muted)"
        strokeWidth="1.8"
      />
      <path
        className="vault-half"
        d="M50 40 A36 36 0 0 1 86 76"
        stroke="var(--ink-muted)"
        strokeWidth="1.8"
      />

      {/* Огни: центр (50, 76), радиус 36, углы 180° 150° 120° 90° 60° 30° 0°. */}
      <circle className="vault-light vault-l0" cx="50" cy="40" r="4.2" fill="var(--accent)" />
      <circle className="vault-light vault-l1" cx="32" cy="44.82" r="2.8" fill="var(--ink)" />
      <circle className="vault-light vault-l1" cx="68" cy="44.82" r="2.8" fill="var(--ink)" />
      <circle className="vault-light vault-l2" cx="18.82" cy="58" r="2.8" fill="var(--ink)" />
      <circle className="vault-light vault-l2" cx="81.18" cy="58" r="2.8" fill="var(--ink)" />
      <circle className="vault-light vault-l3" cx="14" cy="76" r="2.8" fill="var(--ink-muted)" />
      <circle className="vault-light vault-l3" cx="86" cy="76" r="2.8" fill="var(--ink-muted)" />
    </svg>
  );
}
