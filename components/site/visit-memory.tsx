"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";

import {
  MEMORY_VERSION,
  lastSeenKey,
  readVisit,
  today,
  writeVisit,
  type VisitMemory as Memory,
} from "@/lib/site-memory";
import type { NavItem } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Приветствие показывается после первого экрана, а не вместе с ним. */
const APPEAR_DELAY = 700;

/** Одно «с возвращением» читается за пару секунд. */
const GREETING_LIFE = 2800;

/** Со ссылкой карточка живёт дольше: по кнопке, гаснущей через две секунды,
 *  попасть невозможно — это была бы издёвка, а не подсказка. */
const HINT_LIFE = 7000;

type Card = { section: NavItem | null };

/**
 * «Сайт вас помнит» — на одном `localStorage`.
 *
 * Возвращаясь, родитель видит короткое приветствие, а если в прошлый раз
 * он читал, скажем, «Стоимость», — ещё и предложение вернуться туда же.
 * Ни CRM, ни сервера, ни аналитики: что именно хранится и чего не хранится,
 * подробно расписано в `lib/site-memory.ts`.
 *
 * Про метрики. Компонент сознательно не рисует ничего ни в серверной разметке,
 * ни в первом клиентском кадре: пока эффект не прочитал хранилище, он
 * возвращает `null`, и сервер с клиентом совпадают дословно. Появляется
 * карточка через 700 мс после монтирования — заведомо позже самой крупной
 * отрисовки, — и появляется `position: fixed`, то есть вне потока. Сдвинуть
 * вёрстку она физически не может: CLS остаётся ровно тем же.
 *
 * Компонент живёт в макете витрины и переживает клиентские переходы, поэтому
 * запись раздела — это эффект на смену адреса, а поздороваться он имеет право
 * ровно один раз за монтирование.
 */
export function VisitMemory({
  items,
  homeHref,
  labels,
}: {
  items: NavItem[];
  homeHref: string;
  labels: {
    welcomeBack: string;
    /** Содержит `{section}` — подставляем название раздела. */
    continueHint: string;
    continueAction: string;
    dismiss: string;
  };
}) {
  const pathname = usePathname();
  const [card, setCard] = useState<Card | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);

  /*
   * `undefined` — «ещё не решали», `null` — «решили молчать».
   *
   * Решение принимается ровно один раз за монтирование и живёт в ссылке,
   * а не во флаге «уже поздоровались». Разница принципиальная: в режиме
   * разработки React монтирует эффект дважды и между вызовами прогоняет
   * уборку. Флаг «уже поздоровались» пережил бы уборку, отменённый таймер —
   * нет, и приветствие не показалось бы ни разу. Здесь второй проход
   * не пересчитывает решение, но заново заводит таймер.
   */
  const decision = useRef<Card | null | undefined>(undefined);

  // Запись раздела — на каждый переход. Ничего не рисует и не трогает состояние.
  useEffect(() => {
    const current = items.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    if (!current) return;

    const now = today();
    const memory: Memory = readVisit() ?? { v: MEMORY_VERSION, first: now, seen: {} };
    memory.seen[current.key] = now;
    writeVisit(memory);
  }, [pathname, items]);

  // Приветствие — один раз за монтирование и только на главной.
  useEffect(() => {
    if (pathname !== homeHref) return;

    if (decision.current === undefined) {
      const now = today();
      const stored = readVisit();

      /*
       * Здороваемся только с тем, кто уже был здесь в другой день, и не чаще
       * раза в сутки. Первый визит остаётся без единого слова: «с возвращением»
       * человеку, который зашёл впервые, — это не забота, а сломанная механика,
       * и она видна сразу.
       */
      if (!stored || stored.first === now || stored.greeted === now) {
        decision.current = null;

        // Первого посетителя надо запомнить — иначе он останется первым навсегда.
        if (!stored) writeVisit({ v: MEMORY_VERSION, first: now, seen: {} });
        return;
      }

      writeVisit({ ...stored, greeted: now });

      const key = lastSeenKey(stored.seen);
      decision.current = { section: key ? (items.find((i) => i.key === key) ?? null) : null };
    }

    const chosen = decision.current;
    if (!chosen) return;

    const timer = window.setTimeout(() => setCard(chosen), APPEAR_DELAY);
    return () => window.clearTimeout(timer);
  }, [pathname, homeHref, items]);

  // Уход по таймеру. Наведение и фокус его останавливают: подсказка не должна
  // исчезать из-под курсора ровно в тот момент, когда до неё дотянулись.
  useEffect(() => {
    if (!card || paused || leaving) return;

    const timer = window.setTimeout(
      () => setLeaving(true),
      card.section ? HINT_LIFE : GREETING_LIFE,
    );

    return () => window.clearTimeout(timer);
  }, [card, paused, leaving]);

  if (!card) return null;

  const hide = () => setLeaving(true);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed right-4 bottom-4 z-40 max-w-[calc(100vw-2rem)] sm:right-6 sm:bottom-6 sm:max-w-sm",
        // Уход снимает карточку с дерева только когда анимация доиграла:
        // иначе она не гаснет, а пропадает.
        leaving
          ? "animate-[toast-out_220ms_var(--ease-exit)_both]"
          : "animate-[toast-in_var(--dur-base)_var(--ease-entrance)_both]",
        "motion-reduce:animate-none",
      )}
      onAnimationEnd={() => {
        if (leaving) setCard(null);
      }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="border-rule bg-paper-raised/95 shadow-float flex items-start gap-3 rounded-xl border p-4 backdrop-blur-md sm:p-5">
        {/* Точка вместо иконки: у карточки нет статуса — ни успеха, ни ошибки,
            ни предупреждения, — и любая пиктограмма приписала бы ей его. */}
        <span aria-hidden="true" className="bg-accent mt-1.5 size-2 shrink-0 rounded-full" />

        <div className="min-w-0 flex-1">
          <p className="text-small text-ink font-semibold">{labels.welcomeBack}</p>

          {card.section ? (
            <>
              <p className="text-caption text-ink-muted mt-1">
                {labels.continueHint.replace("{section}", card.section.label)}
              </p>

              <Link
                href={card.section.href}
                onClick={hide}
                className="text-caption text-accent mt-3 inline-flex items-center gap-1.5 font-semibold transition-transform duration-[180ms] hover:gap-2.5"
              >
                {labels.continueAction}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </>
          ) : null}
        </div>

        <button
          type="button"
          onClick={hide}
          aria-label={labels.dismiss}
          className="text-ink-faint hover:text-ink -mt-1 -mr-1 shrink-0 rounded-full p-1.5 transition-colors duration-[150ms]"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
