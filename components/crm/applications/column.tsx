"use client";

import { useState } from "react";

import { ApplicationCard } from "./card";
import type { BoardApplication } from "@/lib/crm/applications-data";
import type { ApplicationStatus } from "@/lib/supabase/database.types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { cn } from "@/lib/utils";

/**
 * Колонка воронки. Отдельно ведёт своё over-состояние — подсвечивается,
 * только когда карточку тянут именно над ней, а не над соседней колонкой.
 */
export function ApplicationColumn({
  status,
  items,
  t,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
  onOpen,
}: {
  status: ApplicationStatus;
  items: BoardApplication[];
  t: Dictionary;
  draggingId: string | null;
  onDragStart: (id: string, event: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (status: ApplicationStatus) => void;
  onOpen: (id: string) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsOver(false);
        onDrop(status);
      }}
      className={cn(
        "flex w-72 shrink-0 snap-start flex-col rounded-md",
        "transition-colors duration-[150ms]",
        isOver && "bg-accent-soft",
      )}
    >
      <div className="flex items-center justify-between px-1 py-2">
        <h3 className="text-small text-ink font-medium">{t.crm.applications.columns[status]}</h3>
        <span className="text-caption text-ink-faint" data-numeric>
          {items.length}
        </span>
      </div>

      <div className="flex min-h-24 flex-1 flex-col gap-2.5 overflow-y-auto rounded-md border border-dashed border-transparent p-1">
        {items.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            t={t}
            isDragging={draggingId === application.id}
            onOpen={() => onOpen(application.id)}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              onDragStart(application.id, event);
            }}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
