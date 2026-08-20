import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Список, у которого на телефоне открыты первые несколько пунктов.
 *
 * Ни состояния, ни обработчика, ни клиентского компонента: раскрытием
 * управляет скрытый чекбокс, а прячет лишнее CSS через `:has()`. Значит,
 * кнопка работает до загрузки хоть одного килобайта скриптов и не добавляет
 * странице ни байта.
 *
 * `id` обязателен и должен быть уникальным на странице: он связывает подпись
 * с чекбоксом. Раскрытий на одной странице несколько, и общий идентификатор
 * заставил бы их открываться вместе.
 *
 * На планшете и шире раскрытие выключено правилами в globals.css — там место
 * есть, и прятать содержимое незачем.
 */
export function ShowMore({
  id,
  label,
  visible = 3,
  as: Items = "div",
  className,
  itemsClassName,
  children,
}: {
  id: string;
  label: string;
  /** Сколько пунктов видно до раскрытия. */
  visible?: 1 | 2 | 3;
  /**
   * Тег контейнера пунктов.
   *
   * Прятать нужно сами пункты, а не обёртку вокруг них: правило считает
   * `nth-child` у прямых потомков. Поэтому список отдаётся сюда как `ol`
   * или `ul`, а не заворачивается ещё в один слой — иначе у контейнера
   * оказывается ровно один ребёнок и скрывать становится нечего.
   */
  as?: "div" | "ul" | "ol";
  className?: string;
  itemsClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("more-list", className)}
      data-visible={visible === 3 ? undefined : String(visible)}
    >
      {/*
       * Чекбокс скрыт визуально, но не от клавиатуры и не от скринридера:
       * `sr-only` не убирает элемент из дерева доступности, поэтому раскрытие
       * доступно с клавиатуры так же, как обычная кнопка.
       */}
      <input type="checkbox" id={id} className="more-check sr-only" />

      <Items className={cn("more-items", itemsClassName)}>{children}</Items>

      <label
        htmlFor={id}
        className={cn(
          "more-button border-rule text-small text-ink-muted mt-6 flex cursor-pointer",
          "items-center justify-center gap-2 rounded-xs border px-5 py-3 font-semibold",
          "transition-colors duration-[180ms]",
          "hover:border-rule-strong hover:text-ink",
          "peer-focus-visible:outline-accent",
        )}
      >
        {label}
        <ChevronDown className="size-4" aria-hidden="true" />
      </label>
    </div>
  );
}
