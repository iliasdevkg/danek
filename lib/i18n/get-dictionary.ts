import "server-only";

import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/ru";

/**
 * Словари грузятся динамически и только на сервере: в бандл клиента
 * не попадает ни одного байта перевода — ни своего языка, ни двух чужих.
 * Клиентские острова получают нужные строки пропсами.
 */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  ky: () => import("./dictionaries/ky").then((m) => m.ky),
  ru: () => import("./dictionaries/ru").then((m) => m.ru),
  en: () => import("./dictionaries/en").then((m) => m.en),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}

export type { Dictionary };
