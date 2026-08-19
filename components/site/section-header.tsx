import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Рубрика над заголовком.
 *
 * Золотая черта слева и разрядка мелким кеглем — приём журнальной вёрстки:
 * читатель понимает, где начался новый раздел, ещё до того, как прочитал
 * заголовок. На тёмной плашке черта и текст светлеют, чтобы не тонуть.
 */
export function Kicker({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-kicker inline-flex items-center gap-2.5 uppercase",
        tone === "inverse" ? "text-white/70" : "text-highlight",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-px w-6 shrink-0", tone === "inverse" ? "bg-white/40" : "bg-gold")}
      />
      {children}
    </p>
  );
}

/**
 * Заголовок раздела: рубрика, заголовок, лид и необязательное действие справа.
 *
 * `align="center"` нужен разделам во всю ширину — сетка карточек под
 * центрированным заголовком читается спокойнее, чем под прижатым к краю.
 */
export function SectionHeader({
  kicker,
  title,
  lead,
  action,
  align = "start",
  tone = "default",
  className,
}: {
  kicker: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  align?: "start" | "center";
  tone?: "default" | "inverse";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn(centered ? "max-w-2xl" : "max-w-2xl")}>
        <Kicker tone={tone}>{kicker}</Kicker>

        <h2 className={cn("text-h2 mt-4", tone === "inverse" ? "text-white" : "text-ink")}>
          {title}
        </h2>

        {lead ? (
          <p
            className={cn(
              "text-lead mt-4",
              centered && "mx-auto",
              tone === "inverse" ? "text-white/70" : "text-ink-muted",
            )}
          >
            {lead}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
