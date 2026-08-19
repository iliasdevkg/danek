import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Чекбокс на нативном input.
 *
 * Внешний вид собран на CSS, а поведение остаётся браузерным: клавиатура,
 * скринридеры, автозаполнение и отправка формы работают без единой строчки
 * JavaScript. Библиотечный аналог дал бы ту же картинку за лишние килобайты.
 *
 * Отмеченное состояние — зелёное, а не синее. По фирменному языку школы
 * галочка везде зелёная, и метка в `--check-mark` подобрана ровно под
 * `--brand-fg`: в тёмной теме она совпадает с ним цвет в цвет.
 */
export function Checkbox({ className, ...props }: ComponentPropsWithRef<"input">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "peer border-rule-strong bg-paper-raised size-5 shrink-0 cursor-pointer appearance-none rounded-xs border",
        "transition-[background-color,border-color,box-shadow,transform] duration-[150ms] ease-(--ease-standard)",
        "hover:border-ink-faint",
        "checked:border-brand checked:bg-brand",
        "checked:hover:border-brand-hover checked:hover:bg-brand-hover",
        // Галочка нарисована фоном: без псевдоэлементов, которые input не поддерживает.
        "checked:bg-[length:0.75rem_0.75rem] checked:bg-center checked:bg-no-repeat",
        "checked:bg-[image:var(--check-mark)]",
        // Нажатие ощущается физически, как у кнопки.
        "active:scale-95",
        "disabled:hover:border-rule-strong disabled:cursor-not-allowed disabled:opacity-45",
        // Незаполненное согласие — красная рамка и кольцо: на мелком квадрате
        // одной рамки в 1px недостаточно, чтобы промах бросился в глаза.
        "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20 aria-[invalid=true]:ring-[3px]",
        className,
      )}
      {...props}
    />
  );
}
