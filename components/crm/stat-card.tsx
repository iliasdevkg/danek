import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Плитка с цифрой на дашборде.
 *
 * Цифра — крупная и табличная (не «пляшет» по ширине при обновлении),
 * подпись поясняет период или условие, чтобы «12» не читалось загадкой.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-rule bg-paper-raised rounded-md border p-5", className)}>
      <div className="text-ink-faint flex items-center gap-2">
        <Icon className="size-4" />
        <p className="text-caption">{label}</p>
      </div>
      <p className="font-display text-h1 text-ink mt-3 leading-none" data-numeric>
        {value}
      </p>
      {hint ? <p className="text-caption text-ink-faint mt-2">{hint}</p> : null}
    </div>
  );
}
