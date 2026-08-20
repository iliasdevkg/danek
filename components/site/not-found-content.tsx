"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Route } from "next";

import { Photo } from "@/components/site/photo";
import { buttonVariants } from "@/components/ui/button";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

/** Ровно те строки, что уезжают в браузер, — не весь словарь. */
export type NotFoundStrings = {
  title: string;
  text: string;
  action: string;
  linksTitle: string;
  imageAlt: string;
  admission: string;
  programs: string;
  contacts: string;
};

/**
 * Содержимое страницы 404.
 *
 * Заблудившийся посетитель — это почти всегда родитель, пришедший по старой
 * ссылке из мессенджера. Поэтому здесь не системное сообщение, а разворот
 * школьного сайта: крупный заголовок, фотография во всю колонку и три ссылки туда,
 * куда он с наибольшей вероятностью шёл.
 *
 * Анимации заданы задержками, а не появлением при прокрутке: страница целиком
 * помещается в первый экран, и scroll-driven вход отработал бы вхолостую.
 */
export function NotFoundContent({ strings }: { strings: Record<Locale, NotFoundStrings> }) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale: Locale = isLocale(segment) ? segment : DEFAULT_LOCALE;
  const s = strings[locale];

  const links: { href: Route; label: string }[] = [
    { href: routes.admission(locale), label: s.admission },
    { href: routes.programs(locale), label: s.programs },
    { href: routes.contacts(locale), label: s.contacts },
  ];

  return (
    <section className="bg-paper-tint relative isolate overflow-hidden">
      <div aria-hidden="true" className="deco-dots text-accent absolute inset-0" />

      <div className="shell relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-10">
        {/* -------------------------------------------------------------- Текст */}
        <div className="lg:col-span-6">
          {/* Цифра — знак, а не текст: заголовок ниже говорит то же самое словами,
              поэтому скринридер её пропускает. */}
          <p
            aria-hidden="true"
            className="font-display text-display text-accent/20 animate-[rise_600ms_var(--ease-entrance)_both] leading-none"
            data-numeric
          >
            404
          </p>

          <h1
            className="text-h1 text-ink mt-4 animate-[rise_600ms_var(--ease-entrance)_both]"
            style={{ animationDelay: "80ms" }}
          >
            {s.title}
          </h1>

          <p
            className="text-lead text-ink-muted mt-5 max-w-xl animate-[rise_600ms_var(--ease-entrance)_both]"
            style={{ animationDelay: "140ms" }}
          >
            {s.text}
          </p>

          <div
            className="mt-9 animate-[rise_600ms_var(--ease-entrance)_both]"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              href={routes.home(locale)}
              className={buttonVariants({ size: "lg", className: "group" })}
            >
              {/* Стрелка отходит назад — жест «вернуться», а не «идти дальше». */}
              <ArrowLeft
                className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:-translate-x-1"
                aria-hidden="true"
              />
              {s.action}
            </Link>
          </div>

          {/* Заголовок блока служит и подписью для навигации: с `aria-label`
              скринридер произнёс бы одну и ту же строку дважды подряд. */}
          <nav
            aria-labelledby="not-found-links"
            className="border-rule mt-10 animate-[fade-in_600ms_var(--ease-entrance)_both] border-t pt-6"
            style={{ animationDelay: "260ms" }}
          >
            <p
              id="not-found-links"
              className="text-caption text-ink-faint font-semibold tracking-[0.16em] uppercase"
            >
              {s.linksTitle}
            </p>

            <ul className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-small text-accent hover:text-accent-hover inline-flex items-center gap-1.5 font-semibold transition-colors duration-[180ms]"
                  >
                    <span className="underline-sweep">{link.label}</span>
                    <ArrowRight
                      className="size-3.5 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* -------------------------------------------------------- Фотография */}
        <div className="lg:col-span-5 lg:col-start-8">
          <div
            className="relative mx-auto w-full max-w-60 animate-[rise_800ms_var(--ease-entrance)_both] sm:max-w-72 lg:max-w-none"
            style={{ animationDelay: "160ms" }}
          >
            <div aria-hidden="true" className="deco-glow absolute -inset-6 -z-10 opacity-40" />

            {/* 480px — ширина пяти колонок из двенадцати в контейнере 1280px;
                ниже lg рамку ограничивает max-w-72. */}
            <figure className="bg-paper-sunken shadow-raised relative aspect-4/5 w-full overflow-hidden rounded-xs">
              <Photo
                src={STOCK_IMAGES.homeHeroKids}
                alt={s.imageAlt}
                sizes="(min-width: 1024px) 480px, 288px"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
