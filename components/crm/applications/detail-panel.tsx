"use client";

import { CheckCircle2, ExternalLink, Mail, Phone } from "lucide-react";
import { useState, useTransition } from "react";

import { ApplicationStatusBadge } from "@/components/crm/application-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { HistoryTimeline } from "./history-timeline";
import {
  assignApplication,
  convertApplicationToStudent,
  rejectApplication,
  scheduleTrial,
  updateApplicationStatus,
} from "@/lib/actions/applications";
import { formatPhone } from "@/lib/content/site-settings";
import { formatDateTime } from "@/lib/format";
import type { ApplicationEvent, BoardApplication, StaffMember } from "@/lib/crm/applications-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { ApplicationStatus } from "@/lib/supabase/database.types";
import { routes } from "@/lib/routes";

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

export function ApplicationDetailPanel({
  application,
  history,
  staff,
  locale,
  t,
  onHistoryRefresh,
}: {
  application: BoardApplication;
  history: ApplicationEvent[];
  staff: StaffMember[];
  locale: Locale;
  t: Dictionary;
  onHistoryRefresh: () => void;
}) {
  const d = t.crm.applications.detail;
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [trialAt, setTrialAt] = useState(application.trialAt?.slice(0, 16) ?? "");
  const [rejectReason, setRejectReason] = useState(application.rejectionReason ?? "");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  function runAction(promise: Promise<{ ok: boolean; error?: string }>, successMessage: string) {
    startTransition(async () => {
      const result = await promise;
      if (result.ok) {
        toast({ title: successMessage, tone: "success" });
        onHistoryRefresh();
      } else {
        toast({ title: t.common.error, description: result.error, tone: "danger" });
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-rule border-b px-6 py-5 pr-14">
        <div className="flex flex-wrap items-center gap-2.5">
          <SheetTitle className="text-h3 text-ink">{application.childName}</SheetTitle>
          <ApplicationStatusBadge status={application.status} t={t} />
        </div>
        <SheetDescription className="text-caption text-ink-faint mt-1">
          {d.createdAt} · <span data-numeric>{formatDateTime(application.createdAt, locale)}</span>
        </SheetDescription>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <div>
            <p className="text-kicker text-ink-faint uppercase">{d.childInfo}</p>
            <p className="text-small text-ink mt-1.5">
              {application.gradeLevel
                ? t.crm.applications.card.grade.replace("{n}", String(application.gradeLevel))
                : t.crm.applications.card.gradeUnknown}
            </p>
          </div>

          <div>
            <p className="text-kicker text-ink-faint uppercase">{d.source}</p>
            <p className="text-small text-ink mt-1.5">
              {t.crm.applications.sources[application.source]}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-kicker text-ink-faint uppercase">{d.parentInfo}</p>
            <p className="text-small text-ink mt-1.5">{application.parentName}</p>
            <a
              href={`tel:${application.parentPhone}`}
              className="text-small text-accent mt-1 flex items-center gap-1.5 hover:underline"
              data-numeric
            >
              <Phone className="size-3.5" />
              {formatPhone(application.parentPhone)}
            </a>
            {application.parentEmail ? (
              <a
                href={`mailto:${application.parentEmail}`}
                className="text-small text-accent mt-1 flex items-center gap-1.5 hover:underline"
              >
                <Mail className="size-3.5" />
                {application.parentEmail}
              </a>
            ) : null}
          </div>

          {application.message ? (
            <div className="sm:col-span-2">
              <p className="text-kicker text-ink-faint uppercase">{t.form.message}</p>
              <p className="text-small text-ink mt-1.5 whitespace-pre-wrap">
                {application.message}
              </p>
            </div>
          ) : null}
        </div>

        <Separator className="my-5" />

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>{d.status}</FieldLabel>
            <FieldControl>
              {(props) => (
                <NativeSelect
                  {...props}
                  value={application.status}
                  disabled={isPending}
                  onChange={(event) =>
                    runAction(
                      updateApplicationStatus(
                        locale,
                        application.id,
                        event.target.value as ApplicationStatus,
                      ),
                      t.common.save,
                    )
                  }
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t.crm.applications.columns[status]}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FieldControl>
          </Field>

          <Field>
            <FieldLabel>{d.assignTo}</FieldLabel>
            <FieldControl>
              {(props) => (
                <NativeSelect
                  {...props}
                  value={application.assignedTo?.id ?? ""}
                  disabled={isPending}
                  onChange={(event) =>
                    runAction(
                      assignApplication(locale, application.id, event.target.value || null),
                      t.common.save,
                    )
                  }
                >
                  <option value="">{t.crm.applications.card.unassigned}</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FieldControl>
          </Field>

          <Field>
            <FieldLabel>{d.trialAt}</FieldLabel>
            <FieldControl>
              {(props) => (
                <div className="flex gap-2">
                  <Input
                    {...props}
                    type="datetime-local"
                    value={trialAt}
                    onChange={(event) => setTrialAt(event.target.value)}
                  />
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={!trialAt || isPending}
                    onClick={() =>
                      runAction(
                        scheduleTrial(locale, application.id, new Date(trialAt).toISOString()),
                        d.moveToTrial,
                      )
                    }
                  >
                    {d.save}
                  </Button>
                </div>
              )}
            </FieldControl>
          </Field>
        </div>

        <Separator className="my-5" />

        {application.studentId ? (
          <div className="border-success/25 bg-success-soft text-small text-success flex items-center gap-2 rounded-sm border px-3.5 py-3">
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="flex-1">{d.studentCreated}</span>
            <a
              href={routes.crmStudent(locale, application.studentId)}
              className="flex items-center gap-1 font-medium underline underline-offset-2"
            >
              {d.openStudent}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
              <DialogTrigger asChild>
                <Button variant="primary">{d.convert}</Button>
              </DialogTrigger>
              <DialogContent closeLabel={t.common.close}>
                <DialogHeader>
                  <DialogTitle>{d.confirmConvert}</DialogTitle>
                  <DialogDescription>{d.confirmConvertHint}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setConvertOpen(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button
                    loading={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await convertApplicationToStudent(locale, application.id);
                        if (result.ok) {
                          toast({ title: d.studentCreated, tone: "success" });
                          setConvertOpen(false);
                          onHistoryRefresh();
                        } else {
                          toast({
                            title: t.common.error,
                            description: result.error,
                            tone: "danger",
                          });
                        }
                      })
                    }
                  >
                    {d.convert}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">{d.reject}</Button>
              </DialogTrigger>
              <DialogContent closeLabel={t.common.close}>
                <DialogHeader>
                  <DialogTitle>{d.confirmReject}</DialogTitle>
                </DialogHeader>
                <Field>
                  <FieldLabel optionalLabel={t.common.optional}>{d.rejectionReason}</FieldLabel>
                  <FieldControl>
                    {(props) => (
                      <Textarea
                        {...props}
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        rows={3}
                      />
                    )}
                  </FieldControl>
                </Field>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setRejectOpen(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button
                    variant="danger"
                    loading={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await rejectApplication(
                          locale,
                          application.id,
                          rejectReason,
                        );
                        if (result.ok) {
                          toast({ title: d.reject, tone: "success" });
                          setRejectOpen(false);
                          onHistoryRefresh();
                        } else {
                          toast({
                            title: t.common.error,
                            description: result.error,
                            tone: "danger",
                          });
                        }
                      })
                    }
                  >
                    {d.reject}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <Separator className="my-5" />

        <p className="text-kicker text-ink-faint mb-3 uppercase">{d.history}</p>
        <HistoryTimeline
          applicationId={application.id}
          events={history}
          locale={locale}
          t={t}
          onNoteAdded={onHistoryRefresh}
        />
      </div>
    </div>
  );
}
