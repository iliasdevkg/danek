"use client";

import * as Primitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;
export const DropdownMenuRadioGroup = Primitive.RadioGroup;

const surface = [
  "z-50 min-w-44 overflow-hidden rounded-md border border-rule bg-paper-raised p-1",
  "shadow-(--shadow-overlay)",
  // Меню появляется из той стороны, к которой прижато, — движение объясняет связь с триггером.
  "data-[state=open]:animate-[panel-in_180ms_var(--ease-entrance)_both]",
  "data-[state=closed]:animate-[panel-out_120ms_var(--ease-exit)_both]",
];

const itemBase = [
  "relative flex cursor-default items-center gap-2 rounded-sm px-2.5 py-2 text-small text-ink",
  "outline-none select-none",
  "data-[highlighted]:bg-paper-sunken",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
];

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content sideOffset={sideOffset} className={cn(surface, className)} {...props} />
    </Primitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Item>) {
  return <Primitive.Item className={cn(itemBase, className)} {...props} />;
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentPropsWithRef<typeof Primitive.RadioItem>) {
  return (
    <Primitive.RadioItem className={cn(itemBase, "pr-8", className)} {...props}>
      {children}
      <Primitive.ItemIndicator className="absolute right-2.5">
        <Check className="text-accent size-3.5" aria-hidden="true" />
      </Primitive.ItemIndicator>
    </Primitive.RadioItem>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      className={cn("text-kicker text-ink-faint px-2.5 pt-2 pb-1.5 uppercase", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn("bg-rule my-1 h-px", className)} {...props} />;
}
