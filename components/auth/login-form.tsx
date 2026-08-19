"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login, type LoginState } from "@/lib/actions/auth";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

const INITIAL_STATE: LoginState = { status: "idle" };

export function LoginForm({
  locale,
  next,
  t,
}: {
  locale: Locale;
  next: string | null;
  t: Dictionary;
}) {
  const boundLogin = login.bind(null, locale, next);
  const [state, formAction, isPending] = useActionState(boundLogin, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-7 flex flex-col gap-4" noValidate>
      <Field>
        <FieldLabel>{t.login.email}</FieldLabel>
        <FieldControl>
          {(props) => (
            <Input
              {...props}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoFocus
              required
            />
          )}
        </FieldControl>
      </Field>

      <Field>
        <FieldLabel>{t.login.password}</FieldLabel>
        <FieldControl>
          {(props) => (
            <Input
              {...props}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          )}
        </FieldControl>
      </Field>

      {state.status === "error" && state.errorKey ? (
        <p
          role="alert"
          className="border-danger/30 bg-danger-soft text-small text-danger rounded-sm border px-3.5 py-2.5"
        >
          {t.login.errors[state.errorKey]}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        block
        loading={isPending}
        loadingLabel={t.login.signingIn}
        className="mt-2"
      >
        {t.login.submit}
      </Button>
    </form>
  );
}
