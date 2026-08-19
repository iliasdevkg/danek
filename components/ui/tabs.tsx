"use client";

import * as Primitive from "@radix-ui/react-tabs";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

export const Tabs = Primitive.Root;

export function TabsList({ className, ...props }: ComponentPropsWithRef<typeof Primitive.List>) {
  return (
    <Primitive.List
      className={cn("rule-b flex [scrollbar-width:none] gap-1 overflow-x-auto", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      className={cn(
        "text-small text-ink-muted relative -mb-px px-3.5 py-2.5 font-medium whitespace-nowrap",
        "hover:text-ink transition-colors duration-[150ms] ease-(--ease-standard)",
        // Активная вкладка подчёркнута линией того же веса, что и разделитель списка.
        "after:bg-accent after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:scale-x-0",
        "after:transition-transform after:duration-[240ms] after:ease-(--ease-entrance)",
        "data-[state=active]:text-ink data-[state=active]:after:scale-x-100",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentPropsWithRef<typeof Primitive.Content>) {
  return (
    <Primitive.Content
      className={cn(
        "pt-6 outline-none data-[state=active]:animate-[fade-in_200ms_var(--ease-entrance)_both]",
        className,
      )}
      {...props}
    />
  );
}
