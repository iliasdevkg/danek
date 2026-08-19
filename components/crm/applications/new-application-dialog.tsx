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
import { createManualApplication } from "@/lib/actions/applications";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { ApplicationSource } from "@/lib/supabase/database.types";

const SOURCES: ApplicationSource[] = [
  "phone",
  "walk_in",
  "instagram",
  "whatsapp",
  "facebook",
  "referral",
  "other",
];

const EMPTY = {
  childName: "",
  gradeLevel: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  message: "",
  source: "phone" as ApplicationSource,
};

export function NewApplicationDialog({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const a = t.crm.applications;

  function submit() {
    startTransition(async () => {
      const result = await createManualApplication(locale, {
        childName: form.childName,
        gradeLevel: form.gradeLevel ? Number.parseInt(form.gradeLevel, 10) : null,
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        parentEmail: form.parentEmail || null,
        message: form.message || null,
        source: form.source,
      });

      if (result.ok) {
        toast({ title: a.newApplication, tone: "success" });
        setForm(EMPTY);
        setOpen(false);
      } else {
        toast({ title: t.common.error, tone: "danger" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{a.newApplication}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader>
          <DialogTitle>{a.newApplication}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>{t.form.childName}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <Input
                    {...props}
                    value={form.childName}
                    onChange={(e) => setForm({ ...form, childName: e.target.value })}
                  />
                )}
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel optionalLabel={t.common.optional}>{t.form.grade}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <NativeSelect
                    {...props}
                    value={form.gradeLevel}
                    onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
                  >
                    <option value="">—</option>
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel>{t.form.parentName}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <Input
                    {...props}
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                  />
                )}
              </FieldControl>
            </Field>
            <Field hint="+996 700 123 456">
              <FieldLabel>{t.form.phone}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <Input
                    {...props}
                    type="tel"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                  />
                )}
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel optionalLabel={t.common.optional}>{t.form.email}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <Input
                    {...props}
                    type="email"
                    value={form.parentEmail}
                    onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                  />
                )}
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel>{a.detail.source}</FieldLabel>
              <FieldControl>
                {(props) => (
                  <NativeSelect
                    {...props}
                    value={form.source}
                    onChange={(e) =>
                      setForm({ ...form, source: e.target.value as ApplicationSource })
                    }
                  >
                    {SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {a.sources[source]}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </FieldControl>
            </Field>
          </div>

          <Field>
            <FieldLabel optionalLabel={t.common.optional}>{t.form.message}</FieldLabel>
            <FieldControl>
              {(props) => (
                <Textarea
                  {...props}
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              )}
            </FieldControl>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button
            loading={isPending}
            disabled={!form.childName.trim() || !form.parentName.trim() || !form.parentPhone.trim()}
            onClick={submit}
          >
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
