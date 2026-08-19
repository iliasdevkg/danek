"use client";

import { createContext, useContext, useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type FieldContextValue = {
  inputId: string;
  hintId: string;
  errorId: string;
  hasError: boolean;
  hasHint: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

function useField(component: string): FieldContextValue {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error(`<${component}> используется вне <Field>`);
  return ctx;
}

/**
 * Обвязка одного поля формы.
 *
 * Компонент существует ради одной вещи, которую вручную забывают в 9 формах
 * из 10: связки label → input → подсказка → ошибка через id и aria-describedby.
 * Скринридер читает не просто «поле ввода», а «Телефон, обязательно,
 * формат +996…, ошибка: проверьте номер».
 */
export function Field({
  children,
  error,
  hint,
  className,
}: {
  children: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  className?: string;
}) {
  const id = useId();

  return (
    <FieldContext.Provider
      value={{
        inputId: `${id}-input`,
        hintId: `${id}-hint`,
        errorId: `${id}-error`,
        hasError: Boolean(error),
        hasHint: Boolean(hint),
      }}
    >
      <div className={cn("flex min-w-0 flex-col gap-2", className)}>
        {children}
        {hint && !error ? <FieldHint>{hint}</FieldHint> : null}
        {error ? <FieldError>{error}</FieldError> : null}
      </div>
    </FieldContext.Provider>
  );
}

export function FieldLabel({
  children,
  optionalLabel,
  className,
}: {
  children: ReactNode;
  /** Помечаем необязательные поля, а не обязательные: их всегда меньше. */
  optionalLabel?: string;
  className?: string;
}) {
  const { inputId } = useField("FieldLabel");

  return (
    <label
      htmlFor={inputId}
      // `w-fit` — чтобы клик мимо короткой подписи не попадал по полю случайно.
      className={cn("text-small text-ink w-fit cursor-pointer font-semibold", className)}
    >
      {children}
      {optionalLabel ? (
        <span className="text-caption text-ink-faint ml-1.5 font-normal">{optionalLabel}</span>
      ) : null}
    </label>
  );
}

/**
 * Отдаёт готовые id и aria-атрибуты в render-prop, поэтому связка не может
 * рассинхронизироваться: одно место истины на всё поле.
 */
export function FieldControl({
  children,
}: {
  children: (props: {
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  }) => ReactNode;
}) {
  const { inputId, hintId, errorId, hasError, hasHint } = useField("FieldControl");

  const describedBy = [hasHint && !hasError ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {children({
        id: inputId,
        "aria-invalid": hasError || undefined,
        "aria-describedby": describedBy || undefined,
      })}
    </>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  const { hintId } = useField("FieldHint");
  return (
    <p id={hintId} className="text-caption text-ink-muted">
      {children}
    </p>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  const { errorId } = useField("FieldError");
  return (
    // role="alert" — ошибка проговаривается сразу, а не при следующем табе.
    <p
      id={errorId}
      role="alert"
      // Появление с подъёмом: ошибка, выскочившая скачком, читается как сбой
      // вёрстки. Анимируются только opacity и transform — работа композитора.
      className="text-caption text-danger flex animate-[rise-sm_var(--dur-fast)_var(--ease-entrance)_both] items-start gap-1.5 font-medium"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 size-3.5 shrink-0">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.75v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.1" r="0.85" fill="currentColor" />
      </svg>
      {children}
    </p>
  );
}
