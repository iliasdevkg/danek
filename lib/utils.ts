import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge обучен нашей типографической шкале.
 *
 * Без этого он не отличал `text-body` (размер) от `text-accent-fg` (цвет):
 * обе утилиты попадали в группу «цвет текста», побеждала последняя, и белая
 * подпись основной кнопки молча превращалась в чёрную — 1.4:1 вместо 12:1.
 * Регистрация шкалы разводит их по разным группам.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display", "h1", "h2", "h3", "lead", "body", "small", "caption", "kicker"],
        },
      ],
    },
  },
});

/**
 * Склейка классов с разрешением конфликтов Tailwind:
 * последний класс той же группы выигрывает, поэтому проп `className`
 * у компонента всегда может переопределить его собственные стили.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
