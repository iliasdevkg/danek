"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createAnnouncement } from "@/lib/actions/announcements";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { AnnouncementAudience } from "@/lib/supabase/database.types";

const AUDIENCES: AnnouncementAudience[] = ["all", "parents", "staff", "teachers", "class"];

export function NewAnnouncementDialog({
  locale,
  t,
  classes,
}: {
  locale: Locale;
  t: Dictionary;
  classes: { id: string; gradeLevel: number; letter: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const f = t.crm.announcements.form;

  function submit() {
    startTransition(async () => {
      const result = await createAnnouncement(locale, {
        title,
        body,
        audience,
        classId: audience === "class" ? classId : null,
      });

      if (result.ok) {
        toast({ title: t.crm.announcements.newAnnouncement, tone: "success" });
        setOpen(false);
        setTitle("");
        setBody("");
      } else {
        toast({ title: t.common.error, tone: "danger" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t.crm.announcements.newAnnouncement}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader>
          <DialogTitle>{t.crm.announcements.newAnnouncement}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>{f.title}</FieldLabel>
            <FieldControl>
              {(props) => (
                <Input
                  {...props}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
              )}
            </FieldControl>
          </Field>

          <Field>
            <FieldLabel>{f.body}</FieldLabel>
            <FieldControl>
              {(props) => (
                <Textarea
                  {...props}
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              )}
            </FieldControl>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>{f.audience}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <NativeSelect
                    {...props}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                  >
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {t.crm.announcements.audience[a]}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </FieldControl>
            </Field>

            {audience === "class" ? (
              <Field>
                <FieldLabel>{f.class}</FieldLabel>
                <FieldControl>
                  {(props) => (
                    <NativeSelect
                      {...props}
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.gradeLevel}
                          {c.letter}
                        </option>
                      ))}
                    </NativeSelect>
                  )}
                </FieldControl>
              </Field>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button
            loading={isPending}
            disabled={title.trim().length < 2 || body.trim().length < 2}
            onClick={submit}
          >
            {f.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
