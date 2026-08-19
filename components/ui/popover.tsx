"use client";

import * as Primitive from "@radix-ui/react-popover";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
export const PopoverAnchor = Primitive.Anchor;

export function PopoverContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        className={cn(
          "border-rule bg-paper-raised z-50 rounded-md border p-3 shadow-(--shadow-overlay) outline-none",
          "data-[state=open]:animate-[panel-in_180ms_var(--ease-entrance)_both]",
          "data-[state=closed]:animate-[panel-out_120ms_var(--ease-exit)_both]",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
