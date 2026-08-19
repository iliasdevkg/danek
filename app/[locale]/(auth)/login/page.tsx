import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { routes } from "@/lib/routes";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const search = await searchParams;
  const next = typeof search.next === "string" ? search.next : null;

  const t = await getDictionary(locale);

  return (
    <>
      <p className="text-kicker text-ink-faint uppercase">{t.login.kicker}</p>
      <h1 className="text-h2 text-ink mt-2">{t.login.title}</h1>
      <p className="text-small text-ink-muted mt-2">{t.login.lead}</p>

      {/*
        Без базы форма входа приняла бы логин и молча не смогла его проверить.
        Показываем причину вместо неработающих полей: «не открывается» с
        объяснением — это ответ, а «не открывается» без объяснения — тупик.
      */}
      {isSupabaseConfigured ? (
        <>
          <LoginForm locale={locale} next={next} t={t} />
          <p className="text-caption text-ink-faint mt-6 text-center">{t.login.noAccount}</p>
        </>
      ) : (
        <div className="border-rule bg-paper-sunken mt-8 flex gap-3 rounded-lg border p-5">
          <span className="icon-tile bg-accent-soft text-accent size-9 shrink-0">
            <Info className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-small text-ink font-semibold">{t.login.notConfiguredTitle}</p>
            <p className="text-small text-ink-muted mt-1.5">{t.login.notConfiguredText}</p>
          </div>
        </div>
      )}

      <a
        href={routes.home(locale)}
        className="text-small text-ink-muted decoration-ink-muted/30 hover:text-ink hover:decoration-ink/40 mt-4 block text-center underline underline-offset-4 transition-colors"
      >
        {t.login.backToSite}
      </a>
    </>
  );
}
