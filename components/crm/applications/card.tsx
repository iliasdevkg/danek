"use client";

import { Phone } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { BoardApplication } from "@/lib/crm/applications-data";
import { formatPhone } from "@/lib/content/site-settings";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { cn } from "@/lib/utils";

/**
 * Карточка заявки на доске.
 *
 * Это <button>, не <div onClick>: доступна с клавиатуры, читается скринридером
 * как элемент управления. Перетаскивание — прогрессивное улучшение поверх
 * этого же элемента, а не единственный способ сменить статус.
 */
export function ApplicationCard({
  application,
  t,
  onOpen,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  application: BoardApplication;
  t: Dictionary;
  onOpen: () => void;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const c = t.crm.applications.card;

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={cn(
        "border-rule bg-paper-raised flex w-full flex-col gap-2.5 rounded-md border p-3.5 text-left",
        "transition-[opacity,transform,border-color] duration-[150ms] ease-(--ease-standard)",
        "hover:border-rule-strong hover:shadow-(--shadow-overlay)",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-small text-ink font-medium">{application.childName}</p>
        <Badge tone="outline" className="shrink-0">
          {application.gradeLevel
            ? c.grade.replace("{n}", String(application.gradeLevel))
            : c.gradeUnknown}
        </Badge>
      </div>

      <p className="text-caption text-ink-muted">{application.parentName}</p>

      <p className="text-caption text-ink-faint flex items-center gap-1.5" data-numeric>
        <Phone className="size-3" />
        {formatPhone(application.parentPhone)}
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <Badge tone="neutral">{t.crm.applications.sources[application.source]}</Badge>

        {application.assignedTo ? (
          <Avatar fullName={application.assignedTo.fullName} className="size-6" />
        ) : (
          <span className="text-caption text-ink-faint">{c.unassigned}</span>
        )}
      </div>
    </button>
  );
}
