"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Десктопное меню. Клиентское — ради подсветки текущего раздела: рантайм
 * роутера всё равно загружен, поэтому usePathname не добавляет вес странице.
 *
 * Активный пункт помечен золотой чертой под словом, а не заливкой: заливка
 * в строке из шести пунктов читается как кнопка и спорит с «Подать заявку».
 * Черта выезжает из центра, а не появляется скачком.
 */
export function SiteNav({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="hidden items-center gap-0.5 xl:flex">
      {items.map((item) => {
        // Раздел активен и на своей странице, и на вложенной (новость внутри новостей).
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "text-small relative rounded-full px-3.5 py-2 font-medium whitespace-nowrap",
              "transition-colors duration-[150ms] ease-(--ease-standard)",
              "after:bg-gold after:absolute after:inset-x-3.5 after:bottom-0.5 after:h-0.5 after:rounded-full",
              "after:scale-x-0 after:transition-transform after:duration-[240ms] after:ease-(--ease-entrance)",
              "hover:after:scale-x-100",
              isActive ? "text-ink after:scale-x-100" : "text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
