"use client";

import * as Primitive from "@radix-ui/react-avatar";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

/** Инициалы из «Айгүл Сыдыкова» → «АС». Работает и с одним словом. */
export function initialsOf(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function Avatar({
  fullName,
  src,
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Root> & { fullName: string; src?: string | null }) {
  return (
    <Primitive.Root
      className={cn(
        "bg-paper-sunken grid size-10 shrink-0 place-items-center overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <Primitive.Image src={src ?? undefined} alt="" className="size-full object-cover" />
      {/* Инициалы появляются только если фото не загрузилось — не мигают поверх. */}
      <Primitive.Fallback
        delayMs={src ? 300 : 0}
        className="text-caption text-ink-muted font-medium"
      >
        {initialsOf(fullName)}
      </Primitive.Fallback>
    </Primitive.Root>
  );
}
