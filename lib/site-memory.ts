import { SITE_NAV_KEYS, type SiteNavKey } from "@/lib/routes";

/**
 * Память браузера о прошлых визитах.
 *
 * Что здесь хранится и, главное, чего здесь нет.
 *
 * Хранится ровно два вида отметок: дата первого визита и набор «какие разделы
 * сайта открывали и когда». Разделы — не произвольные адреса, а восемь ключей
 * из меню; ничего, кроме них, в запись не попадёт, даже если пользователь
 * стоит на странице конкретной новости или альбома. Даты — без времени суток:
 * знать час визита незачем, а дата с точностью до дня хуже опознаёт человека.
 *
 * Не хранится ничего: ни имени, ни телефона, ни почты, ни идентификатора,
 * ни адреса перехода, ни отпечатка браузера. Запись не покидает устройство —
 * ни сервера школы, ни CRM, ни аналитики: это `localStorage` и только он.
 * Очистка истории браузера стирает её целиком.
 *
 * Формат версионирован. Запись со старой или испорченной версией не чинится,
 * а отбрасывается: цена ошибки — одно непоказанное приветствие.
 */

const STORAGE_KEY = "danek.visit";

export const MEMORY_VERSION = 1;

export type VisitMemory = {
  v: number;
  /** Дата первого визита, `YYYY-MM-DD`. */
  first: string;
  /** Раздел меню → дата последнего просмотра. */
  seen: Partial<Record<SiteNavKey, string>>;
  /** Дата последнего приветствия: здороваемся не чаще раза в день. */
  greeted?: string;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Локальная дата без времени. `toISOString()` не годится: он в UTC, и после
 *  вечера по Бишкеку вернул бы вчерашний день. */
export function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && DATE.test(value);
}

/**
 * Читает запись, проверяя каждое поле.
 *
 * Разбор строгий не из педантизма: `localStorage` — общая на весь домен
 * песочница, в которую пишет что угодно, включая расширения браузера
 * и прошлые версии этого же сайта. Всё, что не совпало с ожидаемой формой,
 * считается отсутствующим.
 */
export function readVisit(): VisitMemory | null {
  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Приватный режим Safari и запрет хранилища в настройках бросают здесь
    // исключение. Сайт обязан работать дальше как для первого посетителя.
    return null;
  }

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const record = parsed as Record<string, unknown>;
    if (record.v !== MEMORY_VERSION || !isDate(record.first)) return null;

    const seen: Partial<Record<SiteNavKey, string>> = {};
    const stored = record.seen;

    if (typeof stored === "object" && stored !== null) {
      for (const key of SITE_NAV_KEYS) {
        const value = (stored as Record<string, unknown>)[key];
        if (isDate(value)) seen[key] = value;
      }
    }

    return {
      v: MEMORY_VERSION,
      first: record.first,
      seen,
      greeted: isDate(record.greeted) ? record.greeted : undefined,
    };
  } catch {
    return null;
  }
}

export function writeVisit(memory: VisitMemory): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Переполненное хранилище или запрет на запись. Ничего не делаем:
    // память о визитах — украшение, а не условие работы сайта.
  }
}

/**
 * Самый свежий из просмотренных разделов.
 *
 * При равных датах побеждает тот, что раньше в меню: порядок пунктов
 * и есть порядок важности для родителя, а угадывать между «Программами»
 * и «Галереей», открытыми в один день, всё равно не по чему.
 */
export function lastSeenKey(
  seen: Partial<Record<SiteNavKey, string>>,
  exclude?: SiteNavKey,
): SiteNavKey | null {
  let best: SiteNavKey | null = null;

  for (const key of SITE_NAV_KEYS) {
    const date = seen[key];
    if (!date || key === exclude) continue;
    if (!best || date > seen[best]!) best = key;
  }

  return best;
}
