import type { Json } from "@/lib/supabase/database.types";

/**
 * Реестр настроек сайта: какие ключи вообще существуют, какого они вида
 * и какие из них видны публике.
 *
 * Реестр нужен из-за неочевидной ловушки. Колонка `site_settings.is_public`
 * по умолчанию `false`, а публичное чтение идёт под политикой `using (is_public)`.
 * Действие сохранения писало только `{key, value}` — и любой ключ, которого
 * ещё нет в засеянных, сохранялся успешно и потом просто не появлялся на сайте.
 * Молча: ни ошибки, ни пустого поля, ни следа в логе.
 *
 * Наивное лечение — дописать `is_public: true` в upsert — публикует расчётный
 * счёт школы и строку для QR оплаты. Поэтому флаг берётся отсюда, по ключу,
 * а не подставляется одинаковым для всех.
 *
 * Второе назначение: неизвестный ключ отвергается. Форма в админке не может
 * записать в таблицу произвольную строку, даже если её подменили в браузере.
 */
export type SettingKind =
  /** Обычная строка: телефон, ссылка, путь в бакете. */
  | "string"
  /** Массив строк: дополнительные телефоны. */
  | "string[]"
  /** Три языка: `{ky, ru, en}`. */
  | "i18n"
  /** Точка на карте: `{lat, lng}` или `null`. */
  | "latlng"
  /** Путь к картинке в бакете media. */
  | "media"
  /** Цифры на главной: `[{value, label: I18nText}]`. */
  | "stats";

export type SettingSpec = {
  kind: SettingKind;
  /** Виден ли ключ анонимному посетителю сайта. */
  public: boolean;
  /** Затрагивает ли изменение публичные страницы — от этого зависит сброс кэша. */
  affectsSite: boolean;
};

export const SITE_SETTINGS = {
  "contacts.phone_primary": { kind: "string", public: true, affectsSite: true },
  "contacts.phone_extra": { kind: "string[]", public: true, affectsSite: true },
  "contacts.email": { kind: "string", public: true, affectsSite: true },
  "contacts.address": { kind: "i18n", public: true, affectsSite: true },
  "contacts.work_hours": { kind: "i18n", public: true, affectsSite: true },
  "contacts.map": { kind: "latlng", public: true, affectsSite: true },

  "social.instagram": { kind: "string", public: true, affectsSite: true },
  "social.facebook": { kind: "string", public: true, affectsSite: true },
  "social.whatsapp": { kind: "string", public: true, affectsSite: true },
  "social.telegram": { kind: "string", public: true, affectsSite: true },

  "home.hero_image": { kind: "media", public: true, affectsSite: true },
  "home.stats": { kind: "stats", public: true, affectsSite: true },

  /*
   * Реквизиты видит только вошедший родитель в своём кабинете — кабинет
   * рендерится динамически под сессией, поэтому публичным ключ делать нельзя
   * и сбрасывать кэш витрины незачем.
   */
  "payment.bank_name": { kind: "string", public: false, affectsSite: false },
  "payment.account": { kind: "string", public: false, affectsSite: false },
  "payment.recipient": { kind: "string", public: false, affectsSite: false },
  "payment.qr_payload": { kind: "string", public: false, affectsSite: false },
} as const satisfies Record<string, SettingSpec>;

export type SiteSettingKey = keyof typeof SITE_SETTINGS;

export function isSiteSettingKey(key: string): key is SiteSettingKey {
  return Object.hasOwn(SITE_SETTINGS, key);
}

export type SettingEntry = { key: SiteSettingKey; value: Json };
