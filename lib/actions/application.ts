"use server";

import { headers } from "next/headers";

import { getPublicSupabase } from "@/lib/supabase/public";
import type { Json } from "@/lib/supabase/database.types";
import {
  HONEYPOT_FIELD,
  applicationSchema,
  collectFieldErrors,
  type ApplicationFormState,
} from "@/lib/validation/application";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function readUtm(formData: FormData): Json {
  const utm: Record<string, string> = {};

  for (const key of UTM_KEYS) {
    const value = formData.get(key);
    if (typeof value === "string" && value.trim()) {
      utm[key] = value.trim().slice(0, 200);
    }
  }

  return utm;
}

/**
 * Приём заявки с публичного сайта.
 *
 * Пишем анонимным клиентом, а не служебным ключом: политика RLS уже разрешает
 * ровно одну безопасную вставку — статус «новая», источник «сайт», менеджер не
 * назначен. Форма работает даже если служебный ключ не заведён, а подделать
 * зачисление через это API нельзя.
 */
export async function submitApplication(
  _prevState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  // Поле-ловушка заполнил только бот. Отвечаем успехом: узнав об отказе,
  // спамер подберёт обход, а так он считает, что всё получилось.
  if (typeof formData.get(HONEYPOT_FIELD) === "string" && formData.get(HONEYPOT_FIELD)) {
    return { status: "success" };
  }

  // Согласие проверяется и на сервере: снять галочку через DevTools проще,
  // чем кажется, а обработка данных ребёнка без согласия недопустима.
  if (formData.get("consent") !== "on") {
    return { status: "error", errorKey: "required" };
  }

  const parsed = applicationSchema.safeParse({
    childName: formData.get("childName") ?? "",
    childBirthDate: formData.get("childBirthDate") ?? "",
    gradeLevel: formData.get("gradeLevel") ?? "",
    parentName: formData.get("parentName") ?? "",
    parentPhone: formData.get("parentPhone") ?? "",
    parentEmail: formData.get("parentEmail") ?? "",
    message: formData.get("message") ?? "",
    locale: formData.get("locale") ?? "ru",
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: collectFieldErrors(parsed.error) };
  }

  const supabase = getPublicSupabase();
  if (!supabase) {
    console.error("[application] Supabase не сконфигурирован, заявка не сохранена");
    return { status: "error", errorKey: "generic" };
  }

  const headerList = await headers();
  // За прокси Vercel реальный адрес — первый в цепочке x-forwarded-for.
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  const { data: limited, error: limitError } = await supabase.rpc("application_rate_exceeded", {
    p_phone: parsed.data.parentPhone,
    p_ip: ip,
  });

  if (limitError) {
    console.error("[application] проверка лимита не удалась:", limitError.message);
  } else if (limited) {
    return { status: "error", errorKey: "rateLimited" };
  }

  // Намеренно без .select(): анонимная RLS-политика на applications разрешает
  // только INSERT, SELECT анониму запрещён вовсе. По умолчанию supabase-js шлёт
  // Prefer: return=minimal и строка не возвращается — Postgres не проверяет
  // SELECT-политику. Стоит добавить .select() (например, чтобы получить id),
  // и Postgres потребует ещё и SELECT-доступ — анонимная заявка перестанет
  // сохраняться с ошибкой «new row violates row-level security policy».
  // Если id всё же понадобится на клиенте — генерировать его на клиенте
  // (crypto.randomUUID()) и передавать явным полем, не читать через RETURNING.
  const { error } = await supabase.from("applications").insert({
    child_name: parsed.data.childName,
    child_birth_date: parsed.data.childBirthDate,
    grade_level: parsed.data.gradeLevel,
    parent_name: parsed.data.parentName,
    parent_phone: parsed.data.parentPhone,
    parent_email: parsed.data.parentEmail,
    message: parsed.data.message,
    locale: parsed.data.locale,
    utm: readUtm(formData),
    referrer: (formData.get("referrer") as string | null)?.slice(0, 500) || null,
    submitted_ip: ip,
    status: "new",
    source: "website",
  });

  if (error) {
    console.error("[application] не удалось сохранить заявку:", error.message);
    return { status: "error", errorKey: "generic" };
  }

  return { status: "success" };
}
