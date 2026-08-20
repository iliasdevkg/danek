import "server-only";

import { revalidatePath } from "next/cache";

import { LOCALES, type Locale } from "@/lib/i18n/config";

/**
 * Сброс кэша витрины после правки контента.
 *
 * Модуль существует потому, что в этом месте легко ошибиться дважды, и оба
 * раза — молча: страница просто ещё час показывает старое, и никто не знает,
 * баг это или так задумано.
 *
 * Ошибка первая — область. `getSiteContacts()` вызывается в МАКЕТЕ витрины
 * (`app/[locale]/(site)/layout.tsx`, `revalidate = 3600`), а не на странице.
 * `revalidatePath('/ru')` без второго аргумента целится в страницу и макет
 * не трогает: телефон меняли, а в подвале он оставался прежним.
 *
 * Ошибка вторая — язык. Контент один, а маршрута три. Действие, вызванное
 * русскоязычным администратором, сбрасывало только `/ru/...`, и кыргызская
 * с английской версиями расходились с русской до истечения часа.
 */

/** Все языковые версии одного пути витрины: `news` → /ky/news, /ru/news, /en/news. */
export function revalidateSitePath(path: string) {
  const clean = path.replace(/^\/+/, "");
  for (const locale of LOCALES) {
    revalidatePath(clean ? `/${locale}/${clean}` : `/${locale}`);
  }
}

/**
 * Сброс всей витрины через макет.
 *
 * Нужен, когда изменилось то, что читает макет: контакты, соцсети, цифры
 * на главной. Один вызов на язык покрывает все девять страниц — перечислять
 * их поимённо и не нужно, и опасно: добавится десятая, а список не обновят.
 */
export function revalidateSiteShell() {
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}`, "layout");
  }
}

/** Страница админки — она одна и всегда на языке того, кто её открыл. */
export function revalidateCrmPath(locale: Locale, path: string) {
  revalidatePath(`/${locale}/crm/${path.replace(/^\/+/, "")}`);
}

/** Карта сайта перечисляет новости — публикация и снятие обязаны её сбросить. */
export function revalidateSitemap() {
  revalidatePath("/sitemap.xml");
}
