import type { I18nText, Json } from "@/lib/supabase/database.types";
import { getPublicSupabase } from "@/lib/supabase/public";

import {
  DEMO_ADDRESS,
  DEMO_CONTACT_FACTS,
  DEMO_STATS,
  DEMO_WORK_HOURS,
  isDemoContent,
} from "./demo";
import { EMPTY_I18N } from "./i18n-value";

export type HomeStat = { value: string; label: I18nText };

export type SiteContacts = {
  phonePrimary: string | null;
  phonesExtra: string[];
  email: string | null;
  address: I18nText;
  workHours: I18nText;
  map: { lat: number; lng: number } | null;
  social: {
    instagram: string | null;
    facebook: string | null;
    whatsapp: string | null;
    telegram: string | null;
  };
  heroImage: string | null;
  /** Цифры на главной. Пусто — блок не рисуется: выдуманных достижений не бывает. */
  stats: HomeStat[];
};

/**
 * Пока школа не заполнила настройки — блоки контактов просто не рисуются.
 * Пустой телефон лучше выдуманного: по выдуманному кто-то позвонит.
 */
const EMPTY_CONTACTS: SiteContacts = {
  phonePrimary: null,
  phonesExtra: [],
  email: null,
  address: EMPTY_I18N,
  workHours: EMPTY_I18N,
  map: null,
  social: { instagram: null, facebook: null, whatsapp: null, telegram: null },
  heroImage: null,
  stats: [],
};

/**
 * Контакты витрины до подключения CRM.
 *
 * Телефон, Instagram и WhatsApp — настоящие, из открытого профиля школы.
 * Точный адрес, почта и координаты карты остаются пустыми намеренно:
 * по выдуманному адресу родитель поедет, а на выдуманную почту напишет.
 * Соответствующие блоки просто не рисуются, пока школа их не заполнит.
 */
const DEMO_CONTACTS: SiteContacts = {
  phonePrimary: DEMO_CONTACT_FACTS.phone,
  phonesExtra: [],
  email: null,
  address: DEMO_ADDRESS,
  workHours: DEMO_WORK_HOURS,
  map: null,
  social: {
    instagram: DEMO_CONTACT_FACTS.instagram,
    facebook: null,
    whatsapp: DEMO_CONTACT_FACTS.whatsapp,
    telegram: null,
  },
  heroImage: null,
  stats: DEMO_STATS,
};

function fallbackContacts(): SiteContacts {
  return isDemoContent ? DEMO_CONTACTS : EMPTY_CONTACTS;
}

function asString(value: Json | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asStringArray(value: Json | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && !!v.trim())
    : [];
}

function asI18n(value: Json | undefined): I18nText {
  if (!value || typeof value !== "object" || Array.isArray(value)) return EMPTY_I18N;
  const record = value as Record<string, unknown>;
  return {
    ky: typeof record.ky === "string" ? record.ky : "",
    ru: typeof record.ru === "string" ? record.ru : "",
    en: typeof record.en === "string" ? record.en : "",
  };
}

function asStats(value: Json | undefined): HomeStat[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const statValue = typeof record.value === "string" ? record.value.trim() : "";
    if (!statValue) return [];
    return [{ value: statValue, label: asI18n(record.label as Json) }];
  });
}

function asLatLng(value: Json | undefined): { lat: number; lng: number } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return typeof record.lat === "number" && typeof record.lng === "number"
    ? { lat: record.lat, lng: record.lng }
    : null;
}

/**
 * Контакты и соцсети для шапки, подвала и страницы «Контакты».
 *
 * Сбой базы не должен ронять витрину: школа теряет блок контактов на время
 * инцидента, но не весь сайт. Ошибка при этом попадает в логи, а не глотается.
 */
export async function getSiteContacts(): Promise<SiteContacts> {
  const supabase = getPublicSupabase();
  if (!supabase) return fallbackContacts();

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("is_public", true);

  if (error || !data) {
    console.error("[site-settings] не удалось прочитать настройки:", error?.message);
    return EMPTY_CONTACTS;
  }

  const byKey = new Map(data.map((row) => [row.key, row.value]));

  return {
    phonePrimary: asString(byKey.get("contacts.phone_primary")),
    phonesExtra: asStringArray(byKey.get("contacts.phone_extra")),
    email: asString(byKey.get("contacts.email")),
    address: asI18n(byKey.get("contacts.address")),
    workHours: asI18n(byKey.get("contacts.work_hours")),
    map: asLatLng(byKey.get("contacts.map")),
    social: {
      instagram: asString(byKey.get("social.instagram")),
      facebook: asString(byKey.get("social.facebook")),
      whatsapp: asString(byKey.get("social.whatsapp")),
      telegram: asString(byKey.get("social.telegram")),
    },
    heroImage: asString(byKey.get("home.hero_image")),
    stats: asStats(byKey.get("home.stats")),
  };
}

/** +996700123456 → +996 700 123 456. Номер должен читаться, а не расшифровываться. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 12 || !digits.startsWith("996")) return phone;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
}
