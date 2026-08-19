"use client";

import { usePathname } from "next/navigation";

import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_LABELS,
  LOCALE_SHORT,
  localizePathname,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Переключатель языка — три ссылки, а не выпадающий список.
 *
 * Выпадающий список на Radix стоил бы около 45 КБ скриптов на каждой странице
 * ради выбора из трёх пунктов. Здесь это обычные ссылки: они видны сразу,
 * индексируются поисковиком и работают до загрузки любого JS.
 *
 * Cookie ставится по клику, а не в proxy: заголовок Set-Cookie на публичной
 * странице сделал бы её некэшируемой на CDN.
 *
 * Ссылки намеренно обычные <a>, а не <Link>. Смена языка меняет языковой
 * сегмент маршрута, то есть корневой макет, — при клиентском переходе React
 * пересобирает всё дерево документа и возвращает <html> к серверным значениям
 * lang и data-theme. Тёмная тема при этом мигала светлой. Полная перезагрузка
 * стоит недорого (страницы статические и раздаются с CDN), а взамен документ
 * приходит уже с правильным языком, темой и всем текстом на новом языке.
 */
export function LangSwitcher({
  current,
  label,
  className,
}: {
  current: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("text-caption flex items-center gap-0.5 font-medium tracking-wide", className)}
    >
      {LOCALES.map((locale) => {
        const isCurrent = locale === current;

        return (
          <a
            key={locale}
            href={localizePathname(pathname, locale)}
            hrefLang={locale}
            lang={locale}
            aria-current={isCurrent ? "true" : undefined}
            title={LOCALE_LABELS[locale]}
            onClick={() => {
              // Пишем куку прямо в обработчике клика, а не через вынесенную
              // функцию: так статический анализатор React Compiler однозначно
              // видит, что запись в document происходит только по событию,
              // а не как часть тела рендера.
              document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
            }}
            className={cn(
              "rounded-xs px-1.5 py-1.5 transition-colors duration-[150ms]",
              isCurrent ? "text-ink" : "text-ink-faint hover:text-ink",
            )}
          >
            {LOCALE_SHORT[locale]}
          </a>
        );
      })}
    </div>
  );
}
