"use client";

import * as Primitive from "@radix-ui/react-tooltip";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const TooltipProvider = Primitive.Provider;

/**
 * Подсказка — только дополнение к видимой подписи, никогда не единственный
 * источник смысла: на тач-устройствах hover не существует.
 */
export function Tooltip({
  children,
  content,
  side = "top",
  ...props
}: ComponentPropsWithRef<typeof Primitive.Content> & {
  children: ReactNode;
  content: ReactNode;
}) {
  return (
    <Primitive.Root>
      <Primitive.Trigger asChild>{children}</Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            "bg-paper-inverse text-caption text-ink-inverse z-50 rounded-sm px-2.5 py-1.5",
            "data-[state=delayed-open]:animate-[fade-in_120ms_var(--ease-standard)_both]",
            "data-[state=closed]:animate-[fade-out_90ms_var(--ease-exit)_both]",
          )}
          {...props}
        >
          {content}
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
