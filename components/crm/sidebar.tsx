"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import type { CurrentUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { CrmNavItem } from "@/lib/crm/nav";
import { routes } from "@/lib/routes";
import { CRM_NAV_ICONS } from "@/components/crm/nav-icons";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/site/wordmark";

/**
 * Боковая навигация CRM — постоянно видна на широком экране.
 *
 * Отдельный компонент от MobileNav сайта: здесь плотнее, без анимаций входа —
 * сотрудник открывает CRM по многу раз в день, лишнее движение утомляет.
 */
export function CrmSidebar({
  locale,
  t,
  items,
  user,
  signOutAction,
}: {
  locale: Locale;
  t: Dictionary;
  items: CrmNavItem[];
  user: CurrentUser;
  /** Серверный экшен выхода — форма работает и до гидратации, без лишнего JS. */
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="border-rule bg-paper-raised hidden w-64 shrink-0 flex-col border-r lg:flex">
      <div className="border-rule flex h-16 items-center border-b px-5">
        <Link href={routes.home(locale)} className="rounded-xs">
          <Wordmark name={t.meta.siteName} className="w-fit" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${locale}/crm` && pathname.startsWith(`${item.href}/`));

            // Значок подбирается здесь, на клиенте: через границу RSC приходит
            // только ключ пункта — см. components/crm/nav-icons.tsx.
            const Icon = CRM_NAV_ICONS[item.key];

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "text-small flex items-center gap-2.5 rounded-sm px-3 py-2 font-medium transition-colors duration-[150ms]",
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-ink-muted hover:bg-paper-sunken hover:text-ink",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-rule border-t p-3">
        <div className="flex items-center gap-2.5 rounded-sm px-2 py-2">
          <Avatar fullName={user.fullName} src={user.avatarUrl} className="size-8" />
          <div className="min-w-0 flex-1">
            <p className="text-small text-ink truncate font-medium">{user.fullName}</p>
            <p className="text-caption text-ink-faint truncate">
              {t.crm.roleLabel[user.role as "admin" | "manager" | "teacher"]}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label={t.crm.signOut}
              title={t.crm.signOut}
              className="text-ink-faint hover:bg-paper-sunken hover:text-danger grid size-8 shrink-0 place-items-center rounded-sm transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
