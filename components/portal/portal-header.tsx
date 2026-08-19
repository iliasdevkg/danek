"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { LangSwitcher } from "@/components/site/lang-switcher";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Wordmark } from "@/components/site/wordmark";
import type { CurrentUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";

/** Шапка кабинета родителя/ученика — короче, чем в CRM: разделов немного. */
export function PortalHeader({
  locale,
  t,
  user,
  signOutAction,
}: {
  locale: Locale;
  t: Dictionary;
  user: CurrentUser;
  signOutAction: () => Promise<void>;
}) {
  return (
    <header className="border-rule bg-paper-raised border-b">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={routes.home(locale)} className="shrink-0 rounded-xs">
          <Wordmark name={t.meta.siteName} className="w-fit" />
        </Link>

        <div className="flex items-center gap-1.5">
          <Avatar
            fullName={user.fullName}
            src={user.avatarUrl}
            className="mr-1 hidden size-8 sm:grid"
          />
          <LangSwitcher current={locale} label={t.locale.switch} className="hidden sm:flex" />
          <ThemeToggle labels={t.theme} />

          <form action={signOutAction}>
            <button
              type="submit"
              aria-label={t.portal.signOut}
              title={t.portal.signOut}
              className="text-ink-muted hover:bg-paper-sunken hover:text-danger grid size-9 place-items-center rounded-sm transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
