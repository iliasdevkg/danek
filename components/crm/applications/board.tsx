"use client";

import { Search } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";

import { ApplicationColumn } from "./column";
import { ApplicationDetailPanel } from "./detail-panel";
import { NewApplicationDialog } from "./new-application-dialog";
import { Input, NativeSelect } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { updateApplicationStatus } from "@/lib/actions/applications";
import type { ApplicationEvent, BoardApplication, StaffMember } from "@/lib/crm/applications-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { ApplicationSource, ApplicationStatus } from "@/lib/supabase/database.types";

const STATUSES: ApplicationStatus[] = [
  "new",
  "contacted",
  "trial_scheduled",
  "trial_done",
  "accepted",
  "enrolled",
  "rejected",
  "lost",
];

const SOURCES: ApplicationSource[] = [
  "website",
  "instagram",
  "facebook",
  "whatsapp",
  "referral",
  "walk_in",
  "phone",
  "other",
];

export function ApplicationsBoard({
  initialApplications,
  staff,
  fetchHistory,
  locale,
  t,
}: {
  initialApplications: BoardApplication[];
  staff: StaffMember[];
  /** Клиентский компонент не видит cookies — историю запрашиваем через route handler. */
  fetchHistory: (id: string) => Promise<ApplicationEvent[]>;
  locale: Locale;
  t: Dictionary;
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<ApplicationSource | "all">("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [history, setHistory] = useState<ApplicationEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [, startTransition] = useTransition();
  const toast = useToast();

  // Сервер прислал новую заявку с сайта или revalidatePath обновил список —
  // подстраиваем локальную копию прямо во время рендера, без лишнего эффекта.
  // Оптимистичные правки (drag-and-drop) не теряются между этими сбросами:
  // initialApplications меняет ссылку только когда сервер реально прислал
  // новые данные, а не на каждый локальный setApplications.
  const [syncedApplications, setSyncedApplications] = useState(initialApplications);
  if (initialApplications !== syncedApplications) {
    setSyncedApplications(initialApplications);
    setApplications(initialApplications);
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((app) => {
      if (sourceFilter !== "all" && app.source !== sourceFilter) return false;
      if (!query) return true;

      return (
        app.childName.toLowerCase().includes(query) ||
        app.parentName.toLowerCase().includes(query) ||
        app.parentPhone.replace(/\D/g, "").includes(query.replace(/\D/g, ""))
      );
    });
  }, [applications, search, sourceFilter]);

  const byStatus = useMemo(() => {
    const map = new Map<ApplicationStatus, BoardApplication[]>();
    for (const status of STATUSES) map.set(status, []);
    for (const app of filtered) map.get(app.status)?.push(app);
    return map;
  }, [filtered]);

  const loadHistory = useCallback(
    async (id: string) => {
      setHistoryLoading(true);
      const events = await fetchHistory(id);
      setHistory(events);
      setHistoryLoading(false);
    },
    [fetchHistory],
  );

  function openDetail(id: string) {
    setOpenId(id);
    void loadHistory(id);
  }

  function moveApplication(id: string, status: ApplicationStatus) {
    const current = applications.find((a) => a.id === id);
    if (!current || current.status === status) return;

    // Оптимистично двигаем карточку сразу — сервер подтвердит фоном.
    // При ошибке возвращаем как было и показываем тост, а не тихо теряем перенос.
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

    startTransition(async () => {
      const result = await updateApplicationStatus(locale, id, status);
      if (!result.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: current.status } : a)),
        );
        toast({ title: t.common.error, description: result.error, tone: "danger" });
      }
    });
  }

  const openApplication = applications.find((a) => a.id === openId) ?? null;
  const a = t.crm.applications;

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="text-ink-faint pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={a.searchPlaceholder}
            className="pl-9"
          />
        </div>

        <NativeSelect
          value={sourceFilter}
          onChange={(event) => setSourceFilter(event.target.value as ApplicationSource | "all")}
          className="w-auto"
        >
          <option value="all">{a.allSources}</option>
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {a.sources[source]}
            </option>
          ))}
        </NativeSelect>

        <div className="ml-auto">
          <NewApplicationDialog locale={locale} t={t} />
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState title={a.title} description={a.emptyBoard} className="flex-1" />
      ) : (
        <div className="flex flex-1 [scrollbar-width:thin] gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <ApplicationColumn
              key={status}
              status={status}
              items={byStatus.get(status) ?? []}
              t={t}
              draggingId={draggingId}
              onDragStart={(id) => setDraggingId(id)}
              onDragEnd={() => setDraggingId(null)}
              onDrop={(status) => {
                if (draggingId) moveApplication(draggingId, status);
                setDraggingId(null);
              }}
              onOpen={openDetail}
            />
          ))}
        </div>
      )}

      <Sheet open={openApplication !== null} onOpenChange={(next) => !next && setOpenId(null)}>
        {openApplication ? (
          <SheetContent side="right" closeLabel={t.common.close} className="p-0">
            {historyLoading && history.length === 0 ? (
              <div className="text-small text-ink-muted p-6">{t.common.loading}</div>
            ) : (
              <ApplicationDetailPanel
                application={openApplication}
                history={history}
                staff={staff}
                locale={locale}
                t={t}
                onHistoryRefresh={() => void loadHistory(openApplication.id)}
              />
            )}
          </SheetContent>
        ) : null}
      </Sheet>
    </div>
  );
}
