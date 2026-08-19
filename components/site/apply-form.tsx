"use client";

import { ArrowRight, Check, CircleAlert } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { submitApplication } from "@/lib/actions/application";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { SCHOOL } from "@/lib/site";
import type { ApplicationFormState, FormErrorKey } from "@/lib/validation/application";

// Диапазон классов живёт в одном месте: расширили набор — список в форме
// поехал за ним сам, без правки этого файла.
const GRADES = Array.from(
  { length: SCHOOL.gradeTo - SCHOOL.gradeFrom + 1 },
  (_, i) => SCHOOL.gradeFrom + i,
);

const INITIAL_STATE: ApplicationFormState = { status: "idle" };

export function ApplyForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [state, formAction, isPending] = useActionState(submitApplication, INITIAL_STATE);
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(true);

  // Источник перехода читаем в браузере: на статической странице этих данных
  // на сервере нет, а знать, откуда пришла заявка, школе важно. Эти данные не
  // влияют на то, что нарисовано при гидратации (только на скрытые поля формы),
  // поэтому чтение в эффекте здесь не создаёт расхождения сервера и клиента.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collected: Record<string, string> = {};

    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const value = params.get(key);
      if (value) collected[key] = value;
    }
    if (document.referrer) collected.referrer = document.referrer;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- ambient-данные браузера, не часть визуального рендера
    setTracking(collected);
  }, []);

  // Переход формы в состояние «успех» — подстройка состояния прямо во время
  // рендера на смену state.status (см. mobile-nav.tsx), а не эффект: кнопка
  // «Отправить ещё одну заявку» потом сама включает форму обратно через
  // setShowForm, и этот код не должен переоткрывать её на каждый лишний рендер.
  const [handledStatus, setHandledStatus] = useState(state.status);
  if (state.status !== handledStatus) {
    setHandledStatus(state.status);
    if (state.status === "success") setShowForm(false);
  }

  // Сам фокус — императивное действие с DOM, не смена состояния, поэтому
  // законно живёт в эффекте без исключений для линта.
  useEffect(() => {
    if (!showForm) successRef.current?.focus();
  }, [showForm]);

  const errorOf = (field: keyof NonNullable<ApplicationFormState["fieldErrors"]>) => {
    const key = state.fieldErrors?.[field];
    return key ? t.form.errors[key as FormErrorKey] : null;
  };

  if (!showForm) {
    return (
      /*
       * Успех — не строчка под формой, а отдельная панель во весь блок.
       * Зелёный здесь работает как на всём сайте: рост и «получилось».
       * Золото не годится — оно на витрине означает ровно одно, «отсюда
       * начинается приём», а приём уже начался.
       */
      <div
        ref={successRef}
        tabIndex={-1}
        className="border-brand/25 bg-brand-soft flex animate-[panel-in_320ms_var(--ease-entrance)_both] flex-col items-center gap-6 rounded-lg border px-6 py-14 text-center outline-none sm:px-10"
      >
        <span className="bg-brand text-brand-fg shadow-card grid size-16 place-items-center rounded-full">
          <Check className="size-8" strokeWidth={2.5} aria-hidden="true" />
        </span>

        <div className="max-w-md">
          <p className="font-display text-h3 text-ink">{t.form.success}</p>
          <p className="text-body text-ink-muted mt-2.5">{t.form.successHint}</p>
        </div>

        <Button variant="secondary" onClick={() => setShowForm(true)}>
          {t.admission.anotherApplication}
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      // Валидация своя, а не браузерная: системные подсказки приходят на языке
      // браузера и рвут трёхъязычный интерфейс.
      noValidate
      onSubmit={(event) => {
        if (!consent) {
          event.preventDefault();
          setConsentError(t.form.errors.required);
        }
      }}
      className="flex flex-col gap-8"
    >
      <input type="hidden" name="locale" value={locale} />
      {Object.entries(tracking).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      {/* Ловушка для ботов: скрыта от глаз и от скринридера, но есть в DOM. */}
      <div aria-hidden="true" className="absolute left-[-9999px] size-px overflow-hidden">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/*
       * Одна сетка на все поля, а не колонки внутри колонок.
       * Длинные поля — имя ребёнка, имя родителя, сообщение — идут во всю
       * ширину, короткие встают парами: так строка ввода нигде не оказывается
       * короче того, что в неё пишут. Вертикальный зазор больше
       * горизонтального — иначе поля соседних строк слипаются в одну кашу.
       */}
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <Field error={errorOf("childName")} className="sm:col-span-2">
          <FieldLabel>{t.form.childName}</FieldLabel>
          <FieldControl>
            {(props) => (
              <Input {...props} name="childName" autoComplete="off" required maxLength={160} />
            )}
          </FieldControl>
        </Field>

        <Field error={errorOf("childBirthDate")}>
          <FieldLabel optionalLabel={t.common.optional}>{t.form.birthDate}</FieldLabel>
          <FieldControl>
            {(props) => <Input {...props} name="childBirthDate" type="date" />}
          </FieldControl>
        </Field>

        <Field error={errorOf("gradeLevel")}>
          <FieldLabel optionalLabel={t.common.optional}>{t.form.grade}</FieldLabel>
          <FieldControl>
            {(props) => (
              <NativeSelect {...props} name="gradeLevel" defaultValue="">
                <option value="">{t.admission.gradePlaceholder}</option>
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {t.admission.gradeOption.replace("{n}", String(grade))}
                  </option>
                ))}
              </NativeSelect>
            )}
          </FieldControl>
        </Field>

        <Field error={errorOf("parentName")} className="sm:col-span-2">
          <FieldLabel>{t.form.parentName}</FieldLabel>
          <FieldControl>
            {(props) => (
              <Input {...props} name="parentName" autoComplete="name" required maxLength={160} />
            )}
          </FieldControl>
        </Field>

        {/* Формат номера показан подсказкой, а не placeholder: placeholder
            исчезает ровно в тот момент, когда по нему хотят свериться. */}
        <Field error={errorOf("parentPhone")} hint="+996 700 123 456">
          <FieldLabel>{t.form.phone}</FieldLabel>
          <FieldControl>
            {(props) => (
              <Input
                {...props}
                name="parentPhone"
                type="tel"
                // inputMode открывает цифровую клавиатуру — телефон вводят с телефона.
                inputMode="tel"
                autoComplete="tel"
                required
                data-numeric
              />
            )}
          </FieldControl>
        </Field>

        <Field error={errorOf("parentEmail")}>
          <FieldLabel optionalLabel={t.common.optional}>{t.form.email}</FieldLabel>
          <FieldControl>
            {(props) => (
              <Input
                {...props}
                name="parentEmail"
                type="email"
                inputMode="email"
                autoComplete="email"
              />
            )}
          </FieldControl>
        </Field>

        <Field error={errorOf("message")} className="sm:col-span-2">
          <FieldLabel optionalLabel={t.common.optional}>{t.form.message}</FieldLabel>
          <FieldControl>
            {(props) => (
              <Textarea
                {...props}
                name="message"
                rows={4}
                maxLength={2000}
                placeholder={t.form.messagePlaceholder}
              />
            )}
          </FieldControl>
        </Field>
      </div>

      {/* Согласие, ошибка отправки и кнопка отделены линейкой: всё, что выше, —
          ввод, всё, что ниже, — решение отправить. */}
      <div className="border-rule flex flex-col gap-6 border-t pt-7">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              name="consent"
              value="on"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                setConsentError(null);
              }}
              aria-describedby={consentError ? "consent-error" : undefined}
              aria-invalid={consentError ? true : undefined}
              className="mt-0.5"
            />
            <label htmlFor="consent" className="text-small text-ink-muted cursor-pointer">
              {t.admission.consent}
            </label>
          </div>

          {consentError ? (
            // pl-8 — ровно ширина чекбокса с зазором: текст ошибки встаёт под
            // подпись, а не под квадрат.
            <p
              id="consent-error"
              role="alert"
              className="text-caption text-danger animate-[rise-sm_var(--dur-fast)_var(--ease-entrance)_both] pl-8 font-medium"
            >
              {consentError}
            </p>
          ) : null}
        </div>

        {state.status === "error" && state.errorKey ? (
          <p
            role="alert"
            className="border-danger/30 bg-danger-soft text-small text-danger flex animate-[rise-sm_var(--dur-base)_var(--ease-entrance)_both] items-start gap-2.5 rounded-md border px-4 py-3.5"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t.form.errors[state.errorKey]}
          </p>
        ) : null}

        {/* Обёртка нужна: во flex-колонке кнопка растянулась бы на всю ширину
            и на десктопе — здесь она остаётся по размеру подписи. */}
        <div>
          <Button
            type="submit"
            variant="gold"
            size="lg"
            block
            className="group sm:w-auto"
            loading={isPending}
            loadingLabel={t.common.sending}
          >
            {t.admission.submit}
            <ArrowRight
              className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </form>
  );
}
