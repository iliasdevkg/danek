import type { Route } from "next";

import type { AppRole } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/i18n/config";

/** Разделы за логином. Совпадают с сегментами маршрутов после локали. */
export const APP_AREAS = ["crm", "parent", "student"] as const;
export type AppArea = (typeof APP_AREAS)[number];

const AREA_BY_ROLE: Record<AppRole, AppArea> = {
  admin: "crm",
  manager: "crm",
  teacher: "crm",
  parent: "parent",
  student: "student",
};

/** Куда отправить пользователя сразу после входа. */
export function homePathForRole(role: AppRole | null, locale: Locale): Route {
  if (!role) return `/${locale}` as Route;
  return `/${locale}/${AREA_BY_ROLE[role]}` as Route;
}

/** Имеет ли роль право находиться в этом разделе. */
export function canAccessArea(role: AppRole | null, area: string): boolean {
  if (!role) return false;
  return AREA_BY_ROLE[role] === area;
}

export function isAppArea(value: string | undefined): value is AppArea {
  return !!value && (APP_AREAS as readonly string[]).includes(value);
}

/** Роль из claims JWT. Ключ кладёт хук custom_access_token_hook. */
export function roleFromClaims(appMetadata: unknown): AppRole | null {
  if (!appMetadata || typeof appMetadata !== "object") return null;
  const role = (appMetadata as { role?: unknown }).role;
  const known: readonly string[] = ["admin", "manager", "teacher", "parent", "student"];
  return typeof role === "string" && known.includes(role) ? (role as AppRole) : null;
}
