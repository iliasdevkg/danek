import type { Locale } from "./config";

/**
 * Строки экранов 404 и сбоя — единственный кусок переводов, который обязан
 * жить отдельным модулем.
 *
 * `app/[locale]/error.tsx` по контракту Next — граница ошибок, то есть
 * клиентский компонент, и пропсов она не получает: строки ей можно только
 * импортировать. Импорт трёх полных словарей утащил бы ~150 КБ переводов в
 * клиентский бандл каждой страницы под `[locale]` и нарушил бы правило,
 * записанное в `get-dictionary.ts`: «в бандл клиента не попадает ни одного
 * байта перевода». Здесь на язык приходится десять строк.
 *
 * Словари ru/ky/en подставляют этот же объект в свой `errorPage`, поэтому
 * источник правды остаётся один и `t.errorPage` на сервере работает как раньше.
 */
export type ErrorPageStrings = {
  notFoundTitle: string;
  notFoundText: string;
  notFoundAction: string;
  notFoundLinks: string;
  notFoundImageAlt: string;
  crashTitle: string;
  crashText: string;
  crashRetry: string;
  crashCode: string;
  crashImageAlt: string;
};

export const ERROR_PAGE_STRINGS: Record<Locale, ErrorPageStrings> = {
  ky: {
    notFoundTitle: "Барак табылган жок",
    notFoundText: "Шилтеме эскирген окшойт же дарек туура эмес жазылган.",
    notFoundAction: "Башкы бетке",
    notFoundLinks: "Балким, муну издеп жаткандырсыз",
    notFoundImageAlt: "Баштыкчан балдар мектептин короосунда удаа басып баратышат",
    crashTitle: "Барак жүктөлгөн жок",
    crashText: "Бул көйгөйдү биз билебиз. Дагы бир жолу аракет кылыңыз.",
    crashRetry: "Кайталоо",
    crashCode: "Ката коду",
    crashImageAlt: "Чоң киши менен бала китепканада чогуу китеп окуп жатышат",
  },
  ru: {
    notFoundTitle: "Страница не найдена",
    notFoundText: "Похоже, ссылка устарела или в адресе опечатка.",
    notFoundAction: "На главную",
    notFoundLinks: "Может быть, вы искали",
    notFoundImageAlt: "Дети с рюкзаками идут друг за другом по школьному двору",
    crashTitle: "Страница не загрузилась",
    crashText: "Мы уже знаем о проблеме. Попробуйте ещё раз.",
    crashRetry: "Повторить",
    crashCode: "Код ошибки",
    crashImageAlt: "Взрослый и ребёнок вместе читают книгу в библиотеке",
  },
  en: {
    notFoundTitle: "Page not found",
    notFoundText: "The link may be outdated, or there is a typo in the address.",
    notFoundAction: "Go to homepage",
    notFoundLinks: "You may have been looking for",
    notFoundImageAlt: "Children with backpacks walking one after another across the schoolyard",
    crashTitle: "This page failed to load",
    crashText: "We already know about the problem. Please try again.",
    crashRetry: "Retry",
    crashCode: "Error code",
    crashImageAlt: "An adult and a child reading a book together in the library",
  },
};
