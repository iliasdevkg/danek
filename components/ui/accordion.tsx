"use client";

import * as Primitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

export const Accordion = Primitive.Root;

export function AccordionItem({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        "card data-[state=open]:shadow-card overflow-hidden transition-shadow duration-[240ms]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Заголовок вопроса.
 *
 * Знак «плюс» поворачивается в «минус» — одна иконка вместо двух состояний,
 * и поворот сам показывает, что панель раскрылась, без подписи «свернуть».
 */
export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Trigger>) {
  return (
    <Primitive.Header className="flex">
      <Primitive.Trigger
        className={cn(
          "group flex flex-1 items-center justify-between gap-5 p-5 text-left md:p-6",
          "font-display text-h3 text-ink transition-colors duration-[150ms]",
          "hover:text-accent data-[state=open]:text-accent",
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="icon-tile bg-accent-soft text-accent size-9 shrink-0 rounded-full transition-transform duration-[300ms] ease-(--ease-entrance) group-data-[state=open]:rotate-45"
        >
          <Plus className="size-4" />
        </span>
      </Primitive.Trigger>
    </Primitive.Header>
  );
}

/**
 * Тело ответа.
 *
 * Высота анимируется переменной `--radix-accordion-content-height`, которую
 * Radix измеряет сам: раскрытие едет плавно и не прыгает на длинных ответах.
 * Внутренний отступ живёт на вложенном элементе, а не на анимируемом
 * контейнере, — иначе он схлопывался бы вместе с высотой и текст дёргался.
 */
export function AccordionContent({
  className,
  children,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Content>) {
  return (
    <Primitive.Content
      className={cn(
        "text-body text-ink-muted overflow-hidden",
        "data-[state=open]:animate-[accordion-down_280ms_var(--ease-entrance)]",
        "data-[state=closed]:animate-[accordion-up_220ms_var(--ease-standard)]",
        className,
      )}
      {...props}
    >
      <div className="px-5 pb-5 md:px-6 md:pb-6">{children}</div>
    </Primitive.Content>
  );
}
