"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CurrentUser } from "@/lib/auth/session";
import type { CrmNavItem } from "@/lib/crm/nav";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";
import { CRM_NAV_ICONS } from "@/components/crm/nav-icons";
import { cn } from "@/lib/utils";

export function CrmMobileNav({
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
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Подстройка состояния во время рендера при смене маршрута — тот же приём,
  // что в components/site/mobile-nav.tsx.
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t.nav.openMenu}
        className="text-ink hover:bg-paper-sunken grid size-10 place-items-center rounded-sm transition-colors lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent side="bottom" closeLabel={t.nav.closeMenu} className="lg:hidden">
        <SheetTitle className="sr-only">{t.crm.nav.dashboard}</SheetTitle>
        <SheetDescription className="sr-only">{t.crm.nav.dashboard}</SheetDescription>

        <div className="border-rule flex items-center gap-2.5 border-b px-5 pt-2 pb-4">
          <Avatar fullName={user.fullName} src={user.avatarUrl} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="text-small text-ink truncate font-medium">{user.fullName}</p>
            <p className="text-caption text-ink-faint truncate">
              {t.crm.roleLabel[user.role as "admin" | "manager" | "teacher"]}
            </p>
          </div>
        </div>

        <nav className="flex max-h-[55dvh] flex-col overflow-y-auto px-3 py-2">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${locale}/crm` && pathname.startsWith(`${item.href}/`));

            // Значок подбирается здесь, на клиенте: через границу RSC приходит
            // только ключ пункта — см. components/crm/nav-icons.tsx.
            const Icon = CRM_NAV_ICONS[item.key];

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-body flex min-h-12 items-center gap-3 rounded-sm px-3",
                  isActive ? "bg-accent-soft text-accent" : "text-ink",
                )}
              >
                <Icon className="size-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={signOutAction} className="border-rule border-t px-5 py-4">
          <button
            type="submit"
            className="text-small text-danger flex items-center gap-2 font-medium"
          >
            <LogOut className="size-4" />
            {t.crm.signOut}
          </button>
        </form>

        <Link
          href={routes.home(locale)}
          className="text-caption text-ink-faint block px-5 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {t.crm.switchToSite}
        </Link>
      </SheetContent>
    </Sheet>
  );
}
