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
import { Input, NativeSelect } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createScheduleEntry } from "@/lib/actions/schedule";
import type {
  LessonSlotOption,
  ScheduleTeacherOption,
  SubjectOption,
} from "@/lib/crm/schedule-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { Weekday } from "@/lib/supabase/database.types";

const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat"];

export function AddLessonDialog({
  locale,
  t,
  classId,
  subjects,
  teachers,
  slots,
}: {
  locale: Locale;
  t: Dictionary;
  classId: string;
  subjects: SubjectOption[];
  teachers: ScheduleTeacherOption[];
  slots: LessonSlotOption[];
}) {
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [weekday, setWeekday] = useState<Weekday>("mon");
  const [slotId, setSlotId] = useState(slots[0]?.id ?? "");
  const [room, setRoom] = useState("");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const f = t.crm.schedule.form;

  function submit() {
    startTransition(async () => {
      const result = await createScheduleEntry(locale, {
        classId,
        subjectId,
        teacherId,
        weekday,
        lessonSlotId: slotId,
        room: room || null,
      });

      if (result.ok) {
        toast({ title: t.crm.schedule.addLesson, tone: "success" });
        setOpen(false);
        setRoom("");
      } else if (result.error === "conflict") {
        toast({ title: t.crm.schedule.conflict, tone: "danger" });
      } else {
        toast({ title: t.common.error, tone: "danger" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!subjects.length || !teachers.length || !slots.length}>
          {t.crm.schedule.addLesson}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.common.close}>
        <DialogHeader>
          <DialogTitle>{t.crm.schedule.addLesson}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>{f.subject}</FieldLabel>
            <FieldControl>
              {(props) => (
                <NativeSelect
                  {...props}
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FieldControl>
          </Field>

          <Field>
            <FieldLabel>{f.teacher}</FieldLabel>
            <FieldControl>
              {(props) => (
                <NativeSelect
                  {...props}
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  {teachers.map((tch) => (
                    <option key={tch.id} value={tch.id}>
                      {tch.fullName}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FieldControl>
          </Field>

          <Field>
            <FieldLabel>{f.weekday}</FieldLabel>
            <FieldControl>
              {(props) => (
                <NativeSelect
                  {...props}
                  value={weekday}
                  onChange={(e) => setWeekday(e.target.value as Weekday)}
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day} value={day}>
                      {t.crm.schedule.weekdays[day]}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FieldControl>
          </Field>

          <Field>
            <FieldLabel>{f.slot}</FieldLabel>
            <FieldControl>
              {(props) => (
                <NativeSelect {...props} value={slotId} onChange={(e) => setSlotId(e.target.value)}>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.position}. {slot.startsAt.slice(0, 5)}–{slot.endsAt.slice(0, 5)}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FieldControl>
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel optionalLabel={t.common.optional}>{f.room}</FieldLabel>
            <FieldControl>
              {(props) => (
                <Input {...props} value={room} onChange={(e) => setRoom(e.target.value)} />
              )}
            </FieldControl>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button loading={isPending} onClick={submit}>
            {f.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
