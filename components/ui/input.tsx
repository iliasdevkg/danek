import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

/*
 * Общая база полей ввода.
 *
 * Радиус — 14px (`rounded-md`), на ступень меньше карточки с её 20px: поле
 * почти всегда лежит внутри карточки, и вложенная форма обязана скругляться
 * слабее контейнера, иначе углы спорят друг с другом. Таблетку, как у кнопок,
 * поле не берёт намеренно — набранный текст не должен выглядеть нажимаемым.
 *
 * Рамка в покое — `rule-strong`, а не волосяная `rule`: заявка на сайте школы
 * это главный канал обращений, и родитель должен видеть границы поля с первого
 * взгляда, без наведения.
 *
 * Фокус рисует общее проектное кольцо из globals.css — своё здесь заведено не
 * будет. Причина не в экономии: на тёмной плашке глобальное правило само
 * меняет цвет контура на золотой, и форма, вынесенная на `surface-dark`,
 * не теряет видимый фокус. Рамка при этом подкрашивается в синий — контур
 * идёт с отступом в 2px и без подсветки рамки читается как чужой.
 */
const fieldBase = [
  "w-full rounded-md border border-rule-strong bg-paper-raised text-ink",
  "placeholder:text-ink-faint",
  "transition-[border-color,background-color,box-shadow] duration-[150ms] ease-(--ease-standard)",
  "hover:border-ink-faint",
  "focus-visible:border-accent",

  // Ошибка держится на двух сигналах сразу — рамке и заливке, — потому что
  // одного цвета рамки не видно ни при дальтонизме, ни на ярком солнце.
  "aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger-soft",
  "aria-[invalid=true]:hover:border-danger",
  "aria-[invalid=true]:focus-visible:outline-danger",

  // Выключенное поле уходит на второй план целиком: и фоном, и рамкой,
  // и отсутствием реакции на наведение.
  "disabled:cursor-not-allowed disabled:border-rule disabled:bg-paper-sunken",
  "disabled:text-ink-faint disabled:hover:border-rule",

  /*
   * Автозаполнение. Chrome красит подставленное поле собственным фоном —
   * в тёмной теме это белая плашка с чёрным текстом посреди синей формы.
   * Цвет текста перебиваем напрямую, а фон — переходом длиной в неделю:
   * другого способа не дать браузеру закрасить поле у CSS нет.
   */
  "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--ink)]",
  "[&:-webkit-autofill]:[transition:background-color_600000s_0s]",
];

export function Input({ className, ...props }: ComponentPropsWithRef<"input">) {
  return <input className={cn(fieldBase, "text-body h-11 px-4", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentPropsWithRef<"textarea">) {
  return (
    <textarea
      className={cn(
        fieldBase,
        // `field-sizing-content` растит поле под текст там, где он поддержан,
        // потолок не даёт длинному сообщению утащить кнопку за экран,
        // а `resize-y` остаётся запасным вариантом для остальных браузеров.
        "text-body field-sizing-content max-h-64 min-h-32 resize-y px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Нативный <select> вместо кастомного: на мобильных открывается системный
 * барабан, который родителю привычнее любого нашего выпадающего списка.
 */
export function NativeSelect({ className, children, ...props }: ComponentPropsWithRef<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldBase,
          // `peer` нужен стрелке ниже: она должна тускнеть вместе с полем.
          "peer text-body h-11 appearance-none pr-11 pl-4",
          // Пока выбран пустой пункт-подсказка, список выглядит как placeholder
          // соседних полей, а не как уже сделанный выбор.
          "[&:has(option[value='']:checked)]:text-ink-faint",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className={cn(
          "text-ink-muted pointer-events-none absolute top-1/2 right-4 size-3 -translate-y-1/2",
          "transition-colors duration-[150ms] ease-(--ease-standard)",
          "peer-focus-visible:text-accent peer-disabled:text-ink-faint",
        )}
      >
        <path
          d="M2.5 4.5 6 8l3.5-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
