"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

/**
 * Выдвижная панель. На мобильном приезжает снизу — туда дотягивается большой
 * палец; на широком экране справа, где ей место рядом с таблицей.
 * Высота считается в dvh, иначе адресная строка Safari срезает низ панели.
 */
export function SheetContent({
  className,
  children,
  side = "bottom",
  closeLabel,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Content> & {
  side?: "bottom" | "right";
  closeLabel: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "bg-overlay fixed inset-0 z-50",
          "data-[state=open]:animate-[fade-in_180ms_var(--ease-standard)_both]",
          "data-[state=closed]:animate-[fade-out_140ms_var(--ease-exit)_both]",
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "border-rule bg-paper-raised fixed z-50 flex flex-col shadow-(--shadow-overlay)",
          side === "bottom" && [
            "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-md border-t",
            // Учитываем домашнюю полоску iPhone, иначе кнопка уходит под неё.
            "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
            "data-[state=open]:animate-[sheet-in_260ms_var(--ease-entrance)_both]",
            "data-[state=closed]:animate-[sheet-out_180ms_var(--ease-exit)_both]",
          ],
          side === "right" && [
            "inset-y-0 right-0 w-[min(28rem,calc(100vw-2rem))] border-l",
            "data-[state=open]:animate-[slide-from-right_260ms_var(--ease-entrance)_both]",
            "data-[state=closed]:animate-[slide-to-right_180ms_var(--ease-exit)_both]",
          ],
          className,
        )}
        {...props}
      >
        {side === "bottom" ? (
          // Визуальная «ручка»: подсказывает, что панель тянется и закрывается.
          <div aria-hidden="true" className="bg-rule-strong mx-auto mt-3 h-1 w-10 rounded-full" />
        ) : null}

        <DialogPrimitive.Close
          className={cn(
            "text-ink-muted absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-sm",
            "hover:bg-paper-sunken hover:text-ink transition-colors duration-[150ms]",
          )}
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>

        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
