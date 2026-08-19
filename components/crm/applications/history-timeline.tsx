"use client";

import { CalendarClock, MessageSquare, Phone, StickyNote } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { addApplicationNote } from "@/lib/actions/applications";
import { formatDateTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { ApplicationEvent } from "@/lib/crm/applications-data";

const ICON = {
  note: StickyNote,
  call: Phone,
  status_change: CalendarClock,
  message: MessageSquare,
  trial_scheduled: CalendarClock,
} as const;

export function HistoryTimeline({
  applicationId,
  events,
  locale,
  t,
  onNoteAdded,
}: {
  applicationId: string;
  events: ApplicationEvent[];
  locale: Locale;
  t: Dictionary;
  onNoteAdded: () => void;
}) {
  const d = t.crm.applications.detail;
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitNote() {
    const trimmed = note.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await addApplicationNote(locale, applicationId, trimmed);
      if (result.ok) {
        setNote("");
        onNoteAdded();
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={d.notePlaceholder}
          rows={2}
          maxLength={2000}
        />
        <Button
          size="sm"
          variant="secondary"
          className="self-end"
          loading={isPending}
          disabled={!note.trim()}
          onClick={submitNote}
        >
          {d.addNoteAction}
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-small text-ink-faint">{d.noHistory}</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {events.map((event) => {
            const Icon = ICON[event.type];
            return (
              <li key={event.id} className="flex gap-3">
                <div className="bg-paper-sunken text-ink-muted mt-0.5 grid size-7 shrink-0 place-items-center rounded-full">
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-small text-ink">
                    {event.type === "status_change" && event.toStatus
                      ? t.crm.applications.columns[event.toStatus]
                      : event.body ||
                        t.crm.applications.detail[event.type as "note" | "call" | "message"]}
                  </p>
                  <p className="text-caption text-ink-faint mt-0.5">
                    {event.authorName ? `${event.authorName} · ` : ""}
                    <span data-numeric>{formatDateTime(event.createdAt, locale)}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
