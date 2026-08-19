import { notFound } from "next/navigation";

import { CrmMobileNav } from "@/components/crm/mobile-nav";
import { CrmSidebar } from "@/components/crm/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { requireRole } from "@/lib/auth/session";
import { logout } from "@/lib/actions/auth";
import { crmNavItems } from "@/lib/crm/nav";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { routes } from "@/lib/routes";

/**
 * Оболочка CRM: доступна только персоналу (проверено дважды — здесь и в proxy.ts),
 * даёт сайдбар на широком экране и выдвижное меню на телефоне.
 *
 * Сама CRM всегда динамическая — за логином кэшировать нечего, каждая страница
 * показывает актуальные данные конкретного сотрудника. Явный force-dynamic —
 * не только про кэш: без него Next пытается пререндерить страницу на сборке,
 * а там ещё нет ни cookies, ни соединения с Supabase.
 */
export const dynamic = "force-dynamic";

export default async function CrmLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireRole(locale, "admin", "manager", "teacher");
  const t = await getDictionary(locale);
  const items = crmNavItems(locale, user.role, t);

  const signOutAction = async () => {
    "use server";
    await logout(locale);
  };

  return (
    <ToastProvider closeLabel={t.common.close}>
      <div className="bg-paper-sunken flex min-h-dvh">
        <CrmSidebar locale={locale} t={t} items={items} user={user} signOutAction={signOutAction} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-rule bg-paper-raised flex h-16 items-center justify-between border-b px-4 lg:hidden">
            <CrmMobileNav
              locale={locale}
              t={t}
              items={items}
              user={user}
              signOutAction={signOutAction}
            />
            <a href={routes.home(locale)} className="text-small text-ink-muted font-medium">
              {t.crm.switchToSite}
            </a>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
