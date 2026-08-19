import { notFound } from "next/navigation";

import { PortalHeader } from "@/components/portal/portal-header";
import { logout } from "@/lib/actions/auth";
import { requireRole } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireRole(locale, "student");
  const t = await getDictionary(locale);

  const signOutAction = async () => {
    "use server";
    await logout(locale);
  };

  return (
    <div className="bg-paper-sunken min-h-dvh">
      <PortalHeader locale={locale} t={t} user={user} signOutAction={signOutAction} />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
