import "server-only";

import type { Route } from "next";
import { redirect } from "next/navigation";

import type { Locale } from "@/lib/i18n/config";
import { createServerSupabase } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/database.types";

import { homePathForRole, roleFromClaims } from "./roles";

export type CurrentUser = {
  id: string;
  role: AppRole;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  locale: Locale;
};

/**
 * Текущий пользователь для серверных компонентов CRM.
 *
 * Роль читается из JWT (тот же путь, что и в proxy.ts), а не отдельным запросом
 * к profiles: она уже проверена на сервере Supabase при getUser().
 * Имя и аватар — один быстрый select, не полный профиль.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const role = roleFromClaims(user.app_metadata);
  if (!role) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, locale")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    role,
    fullName: profile?.full_name || user.email || "",
    email: user.email ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    locale: (profile?.locale as Locale | undefined) ?? "ru",
  };
}

/**
 * Требует пользователя с одной из перечисленных ролей.
 *
 * proxy.ts уже отсекает большинство случаев на уровне маршрутизации — это вторая,
 * дешёвая линия обороны прямо в компоненте: страница не отрисует ни строчки
 * чужих данных, даже если её вызвали в обход proxy (напрямую как Server Action).
 */
export async function requireRole(locale: Locale, ...roles: AppRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) redirect(`/${locale}/login` as Route);
  if (roles.length > 0 && !roles.includes(user.role)) {
    redirect(homePathForRole(user.role, locale));
  }

  return user;
}
