"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

/*
 * Модальное окно. Radix берёт на себя ловушку фокуса, возврат фокуса на триггер,
 * Esc и блокировку прокрутки — то, что руками почти всегда делается неполно.
 * На нас — вид и характер движения.
 */
export function DialogContent({
  className,
  children,
  closeLabel,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Content> & { closeLabel: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "bg-overlay fixed inset-0 z-50",
          "data-[state=open]:animate-[fade-in_150ms_var(--ease-standard)_both]",
          "data-[state=closed]:animate-[fade-out_120ms_var(--ease-exit)_both]",
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
          "border-rule bg-paper-raised rounded-md border p-6 shadow-(--shadow-overlay)",
          "max-h-[calc(100dvh-2rem)] overflow-y-auto",
          "data-[state=open]:animate-[panel-in_240ms_var(--ease-entrance)_both]",
          "data-[state=closed]:animate-[panel-out_140ms_var(--ease-exit)_both]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "text-ink-muted absolute top-4 right-4 grid size-9 place-items-center rounded-sm",
            "hover:bg-paper-sunken hover:text-ink transition-colors duration-[150ms]",
          )}
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-col gap-1.5 pr-10">{children}</div>;
}

export function DialogTitle({
  className,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-h3 text-ink", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-small text-ink-muted", className)}
      {...props}
    />
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>
  );
}
