import type { Route } from "next";

import type { AppRole } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

export type CrmNavKey =
  | "dashboard"
  | "applications"
  | "students"
  | "classes"
  | "teachers"
  | "schedule"
  | "journal"
  | "finance"
  | "announcements"
  | "content"
  | "settings";

type NavEntry = {
  key: CrmNavKey;
  segment: string;
  /** Пусто — видно всем ролям CRM. */
  roles?: AppRole[];
};

const ENTRIES: NavEntry[] = [
  { key: "dashboard", segment: "" },
  {
    key: "applications",
    segment: "applications",
    roles: ["admin", "manager"],
  },
  { key: "students", segment: "students" },
  { key: "classes", segment: "classes" },
  { key: "teachers", segment: "teachers", roles: ["admin", "manager"] },
  { key: "schedule", segment: "schedule" },
  { key: "journal", segment: "journal" },
  { key: "finance", segment: "finance", roles: ["admin", "manager"] },
  { key: "announcements", segment: "announcements" },
  { key: "content", segment: "content", roles: ["admin", "manager"] },
  { key: "settings", segment: "settings", roles: ["admin"] },
];

/**
 * Пункт меню CRM.
 *
 * Только сериализуемые поля: меню собирает серверный макет, а рисуют его
 * клиентские компоненты, и всё, что не переживает JSON, через эту границу
 * не проходит. Значок клиент подбирает сам по ключу — см. components/crm/nav-icons.tsx.
 */
export type CrmNavItem = {
  key: CrmNavKey;
  href: Route;
  label: string;
};

/**
 * Пункты меню CRM, отфильтрованные под роль.
 *
 * Учитель не видит «Заявки» и «Финансы» — не потому что запрещено технически
 * (RLS всё равно на страже), а потому что пункт меню без доступа только путает.
 */
export function crmNavItems(locale: Locale, role: AppRole, t: Dictionary): CrmNavItem[] {
  return ENTRIES.filter((entry) => !entry.roles || entry.roles.includes(role)).map((entry) => ({
    key: entry.key,
    href: (entry.segment ? `/${locale}/crm/${entry.segment}` : `/${locale}/crm`) as Route,
    label: t.crm.nav[entry.key],
  }));
}
