"use client";

import {
  BarChart3,
  Calendar,
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Newspaper,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";

import type { CrmNavKey } from "@/lib/crm/nav";

/**
 * Значки пунктов меню CRM — на стороне клиента.
 *
 * Раньше значок ехал прямо в объекте пункта меню из lib/crm/nav.ts. Но меню
 * собирает серверный макет, а рисуют его клиентские сайдбар и выдвижная
 * панель, и React отказывается переносить через эту границу что угодно
 * несериализуемое: «Functions cannot be passed directly to Client Components».
 * Компонент значка — как раз функция, поэтому вся CRM падала пятисоткой.
 *
 * Через границу теперь едет только ключ пункта, а сопоставление ключа со
 * значком живёт здесь, в клиентском модуле. Заодно исчез повод тянуть весь
 * набор иконок в серверный бандл.
 */
export const CRM_NAV_ICONS: Record<CrmNavKey, ComponentType<{ className?: string }>> = {
  dashboard: LayoutGrid,
  applications: ClipboardList,
  students: GraduationCap,
  classes: Users,
  teachers: Users,
  schedule: Calendar,
  journal: BarChart3,
  finance: Wallet,
  announcements: Megaphone,
  content: Newspaper,
  settings: Settings,
};
