import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

/*
 * Стили вынесены отдельной функцией, а не спрятаны в компоненте.
 * Ссылка, которая должна выглядеть кнопкой, получает те же классы и остаётся
 * обычным <a> — навигация работает без единого килобайта JS.
 *
 * Форма — таблетка. Она мягче прямоугольника, читается как «нажми меня»
 * без обводок и подсказок и одинаково хорошо смотрится и на витрине,
 * и в плотных таблицах CRM.
 */
const buttonStyles = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 text-center text-balance",
    /*
     * Форма прямоугольная, а не таблетка.
     *
     * Скруглённая до круга кнопка читается как игровая — это была одна
     * из главных примет «детского» вида. Радиус берётся из переменной,
     * поэтому на витрине угол почти прямой, а в админке остаётся мягким:
     * инструменту дружелюбность идёт, оформленной странице — нет.
     */
    "rounded-sm font-semibold",
    "transition-[background-color,border-color,color,box-shadow,transform,opacity]",
    "duration-[180ms] ease-(--ease-standard)",
    // Нажатие ощущается физически: кнопка проседает на пиксель.
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-busy:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        /** Основное действие: синий. Он же весь интерфейс CRM. */
        primary: "bg-accent text-accent-fg shadow-soft hover:bg-accent-hover hover:shadow-card",
        /**
         * Целевое действие витрины — «подать заявку».
         *
         * На тёмной витрине переменная `gold` указывает на белый: белое
         * на почти чёрном — самый сильный контраст, какой бывает на экране,
         * и ему не нужен цвет, чтобы его заметили. В админке та же
         * переменная остаётся жёлтой.
         */
        gold: "bg-gold text-gold-fg hover:brightness-[0.92]",
        secondary:
          "border-rule-strong text-ink hover:border-ink hover:bg-ink/5 border bg-transparent",
        /** На тёмной плашке: контурная кнопка светлым по синему. */
        inverse:
          "border border-white/30 bg-white/5 text-white hover:border-white/70 hover:bg-white/15",
        ghost: "text-ink hover:bg-paper-sunken",
        danger: "bg-danger text-white hover:opacity-90",
        // Ссылка-текст с подчёркиванием, которое доезжает на hover.
        link: [
          "h-auto rounded-none p-0 text-accent underline decoration-from-font",
          "underline-offset-4 decoration-accent/35 hover:decoration-accent",
          "active:translate-y-0",
        ],
      },
      size: {
        sm: "min-h-9 px-4 py-1.5 text-small",
        md: "min-h-11 px-5 py-2 text-body",
        lg: "min-h-13 px-7 py-3 text-body",
        xl: "min-h-14 px-8 py-3.5 text-lead font-bold",
        icon: "size-11 p-0",
      },
      block: {
        true: "w-full",
      },
    },
    compoundVariants: [
      { variant: "link", size: ["sm", "md", "lg", "xl", "icon"], class: "h-auto p-0" },
    ],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/**
 * Классы кнопки для ссылок и любых нестандартных случаев.
 *
 * Обёрнуто в cn намеренно: cva просто дописывает className в конец строки,
 * и `hidden sm:inline-flex` проигрывал базовому `inline-flex` — кнопка,
 * которую просили спрятать на мобильном, оставалась видимой. tailwind-merge
 * снимает конфликт по группам утилит, а не по порядку в файле.
 */
export function buttonVariants({
  className,
  ...variants
}: VariantProps<typeof buttonStyles> & { className?: string } = {}) {
  return cn(buttonStyles(variants), className);
}

type ButtonProps = ComponentPropsWithRef<"button"> &
  VariantProps<typeof buttonStyles> & {
    /** Показывает спиннер и блокирует повторные нажатия. */
    loading?: boolean;
    /** Подпись для скринридера на время загрузки. */
    loadingLabel?: string;
  };

export function Button({
  className,
  variant,
  size,
  block,
  loading = false,
  loadingLabel,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonVariants({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {/* Текст не исчезает и не дёргает ширину — спиннер встаёт поверх. */}
      <span className={cn("contents", loading && "invisible")}>{children}</span>
      {loading ? (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner className="size-4" />
          <span className="sr-only">{loadingLabel ?? "…"}</span>
        </span>
      ) : null}
    </button>
  );
}
