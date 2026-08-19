import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Kicker } from "@/components/site/section-header";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";

/**
 * Шапка внутренней страницы.
 *
 * Одинаковый ритм на всех разделах: хлебные крошки, рубрика, крупный
 * заголовок, лид — читатель всегда понимает, где находится и как вернуться.
 * Тонированная подложка отделяет шапку от содержимого без линейки и делает
 * переход от синей полосы меню к белой странице постепенным.
 */
export function PageHero({
  locale,
  t,
  kicker,
  title,
  lead,
  aside,
}: {
  locale: Locale;
  t: Dictionary;
  kicker: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
}) {
  return (
    <section className="bg-paper-tint relative overflow-hidden">
      <div aria-hidden="true" className="deco-dots text-accent absolute inset-0" />

      <div className="shell relative grid gap-10 py-12 md:py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <nav aria-label={t.nav.breadcrumbLabel} className="mb-6">
            <ol className="text-caption text-ink-faint flex items-center gap-1.5">
              <li>
                <Link href={routes.home(locale)} className="hover:text-accent transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="text-ink-muted font-medium" aria-current="page">
                {title}
              </li>
            </ol>
          </nav>

          <Kicker>{kicker}</Kicker>
          <h1 className="text-h1 text-ink mt-4">{title}</h1>
          {lead ? <p className="text-lead text-ink-muted mt-6 max-w-2xl">{lead}</p> : null}
        </div>

        {aside ? <div className="lg:col-span-4 lg:col-start-9 lg:self-end">{aside}</div> : null}
      </div>
    </section>
  );
}
