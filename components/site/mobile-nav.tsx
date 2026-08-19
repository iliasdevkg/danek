"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogIn, Menu, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { LangSwitcher } from "@/components/site/lang-switcher";
import { formatPhone, type SiteContacts } from "@/lib/content/site-settings";
import type { Locale } from "@/lib/i18n/config";
import type { NavItem } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Мобильное меню.
 *
 * Панель приезжает снизу — туда достаёт большой палец, в отличие от привычного
 * выпадания сверху. Ссылки крупные (48px), проявляются каскадом: глаз успевает
 * проследить порядок, а не получает список вспышкой.
 *
 * Внизу панели — телефон, WhatsApp и вход в кабинет: на телефоне верхней
 * служебной полосы нет, и без них родитель остался бы без единственного
 * способа позвонить в один тап.
 */
export function MobileNav({
  items,
  applyHref,
  locale,
  localeLabel,
  contacts,
  loginHref,
  labels,
}: {
  items: NavItem[];
  applyHref: Route;
  locale: Locale;
  localeLabel: string;
  contacts: SiteContacts;
  loginHref: Route;
  labels: { open: string; close: string; apply: string; menu: string; portal: string };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Переход по ссылке закрывает панель: без этого она висит поверх новой страницы.
  // Подстройка состояния прямо во время рендера (без эффекта) — React специально
  // поддерживает этот приём для «сбросить состояние при смене пропса»: React
  // прерывает рендер и перезапускает его с новым состоянием до того, как что-то
  // успевает нарисоваться, поэтому открытая панель не мелькает на новой странице.
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={labels.open}
        className={cn(
          "text-ink grid size-10 place-items-center rounded-full xl:hidden",
          "hover:bg-paper-sunken transition-colors duration-[150ms]",
        )}
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent side="bottom" closeLabel={labels.close} className="xl:hidden">
        <SheetTitle className="sr-only">{labels.menu}</SheetTitle>
        <SheetDescription className="sr-only">{labels.menu}</SheetDescription>

        <nav className="flex flex-col px-5 pt-6 pb-2">
          {items.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                // Каскад: каждая следующая строка стартует на 28 мс позже.
                style={{ animationDelay: `${60 + index * 28}ms` }}
                className={cn(
                  "border-rule text-h3 flex min-h-12 items-center justify-between border-b py-3",
                  "animate-[rise_320ms_var(--ease-entrance)_both]",
                  isActive ? "text-ink" : "text-ink-muted",
                )}
              >
                {item.label}
                {isActive ? (
                  <span aria-hidden="true" className="bg-gold size-1.5 rounded-full" />
                ) : (
                  <ChevronRight className="text-ink-faint size-4" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-4 px-5 pt-5">
          <Link
            href={applyHref}
            className={buttonVariants({ variant: "gold", size: "lg", block: true })}
          >
            {labels.apply}
          </Link>

          <div className="grid grid-cols-2 gap-2">
            {contacts.phonePrimary ? (
              <a
                href={`tel:${contacts.phonePrimary}`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                data-numeric
              >
                <Phone className="size-3.5" aria-hidden="true" />
                {formatPhone(contacts.phonePrimary)}
              </a>
            ) : null}

            {contacts.social.whatsapp ? (
              <a
                href={contacts.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                <MessageCircle className="size-3.5" aria-hidden="true" />
                WhatsApp
              </a>
            ) : null}
          </div>

          <div className="border-rule flex items-center justify-between gap-3 border-t pt-4">
            <Link
              href={loginHref}
              className="text-small text-ink-muted hover:text-ink inline-flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="size-3.5" aria-hidden="true" />
              {labels.portal}
            </Link>

            <LangSwitcher current={locale} label={localeLabel} className="sm:hidden" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
