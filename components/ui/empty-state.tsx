import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Пустое состояние — такой же экран, как и остальные, а не белое пятно.
 * Всегда объясняет, почему пусто, и предлагает следующий шаг.
 *
 * Пунктир поверх утопленной заливки читается как «место готово, содержимого
 * пока нет» — в отличие от сплошной рамки, которую глаз принимает за карточку
 * с настоящими данными. Один рецепт работает и на витрине, и в плотных
 * таблицах CRM, поэтому отдельного «пустого состояния для админки» нет.
 *
 * Значок и иллюстрация — разные пропсы, а не один с двумя размерами.
 * `icon` садится в плитку 40×40 и годится всюду, включая таблицы CRM, где
 * пустых состояний много и каждое должно быть коротким. `art` — крупный
 * рисунок во всю ширину блока: он уместен там, где пусто целиком, то есть
 * на витрине, и неуместен в плотной админке. Передавать оба сразу незачем,
 * и разметка это проговаривает: рисунок вытесняет значок.
 */
export function EmptyState({
  icon,
  art,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  /** Крупная иллюстрация вместо значка. Только для витрины. */
  art?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-rule-strong flex flex-col items-center justify-center gap-5 rounded-lg border border-dashed",
        "bg-paper-sunken/60 px-6 py-14 text-center",
        className,
      )}
    >
      {art ??
        (icon ? (
          <span aria-hidden="true" className="icon-tile">
            {icon}
          </span>
        ) : null)}

      <div className="flex flex-col gap-2">
        <p className="text-h3 text-ink">{title}</p>
        {description ? (
          <p className="text-small text-ink-muted mx-auto max-w-sm">{description}</p>
        ) : null}
      </div>

      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
