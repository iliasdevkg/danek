"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { homePathForRole, roleFromClaims } from "@/lib/auth/roles";
import type { Locale } from "@/lib/i18n/config";
import { createServerSupabase } from "@/lib/supabase/server";

export type LoginState = {
  status: "idle" | "error";
  errorKey?: "invalidCredentials" | "generic" | "tooManyAttempts";
};

/**
 * Вход по email/паролю.
 *
 * Supabase сам ограничивает частоту попыток на уровне проекта — здесь мы просто
 * различаем «неверный пароль» и «слишком много попыток», чтобы показать разумный
 * текст вместо технической ошибки API.
 */
export async function login(
  locale: Locale,
  next: string | null,
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", errorKey: "invalidCredentials" };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const key = error.status === 429 ? "tooManyAttempts" : "invalidCredentials";
    return { status: "error", errorKey: key };
  }

  const role = roleFromClaims(data.user?.app_metadata);

  // next обязан вести внутрь сайта: открытый редирект — классическая дыра фишинга.
  const safeNext = next && next.startsWith(`/${locale}/`) ? (next as Route) : null;

  redirect(safeNext ?? homePathForRole(role, locale));
}

export async function logout(locale: Locale) {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect(`/${locale}/login` as Route);
}
