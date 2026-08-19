import { z } from "zod";

import { LOCALES } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

import { isValidKgPhone, normalizePhone } from "./phone";

/**
 * Ключи ошибок, а не готовые фразы.
 *
 * Схема одна на три языка: сервер возвращает ключ, интерфейс подставляет
 * перевод. Иначе валидацию пришлось бы дублировать для каждой локали.
 */
export type FormErrorKey = keyof Dictionary["form"]["errors"];

const err = (key: FormErrorKey) => key;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, err("tooLong"))
    .transform((value) => value || null)
    .nullable();

export const applicationSchema = z.object({
  childName: z.string().trim().min(2, err("tooShort")).max(160, err("tooLong")),

  childBirthDate: z
    .string()
    .trim()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), err("invalidDate"))
    // Ребёнок не мог родиться в будущем — самая частая опечатка в году.
    .refine((value) => !value || new Date(value) < new Date(), err("invalidDate"))
    .transform((value) => value || null)
    .nullable(),

  gradeLevel: z
    .string()
    .trim()
    .transform((value) => (value ? Number.parseInt(value, 10) : null))
    .refine((value) => value === null || (value >= 1 && value <= 11), err("required"))
    .nullable(),

  parentName: z.string().trim().min(2, err("tooShort")).max(160, err("tooLong")),

  parentPhone: z
    .string()
    .trim()
    .min(1, err("required"))
    .transform(normalizePhone)
    .refine(isValidKgPhone, err("invalidPhone")),

  parentEmail: z
    .string()
    .trim()
    .refine((value) => !value || z.string().email().safeParse(value).success, err("invalidEmail"))
    .transform((value) => value || null)
    .nullable(),

  message: optionalText(2000),

  locale: z.enum(LOCALES),
});

export type ApplicationInput = z.input<typeof applicationSchema>;
export type ApplicationValues = z.output<typeof applicationSchema>;

/** Имя поля-ловушки. Человек его не видит и не заполняет — бот заполняет всегда. */
export const HONEYPOT_FIELD = "company_website";

export type ApplicationFormState = {
  status: "idle" | "success" | "error";
  /** Ключ общей ошибки формы. */
  errorKey?: FormErrorKey;
  /** Ошибки по полям — тоже ключами. */
  fieldErrors?: Partial<Record<keyof ApplicationValues, FormErrorKey>>;
};

/** Разбирает ZodError в плоскую карту «поле → ключ ошибки». */
export function collectFieldErrors(
  error: z.ZodError<ApplicationValues>,
): Partial<Record<keyof ApplicationValues, FormErrorKey>> {
  const result: Partial<Record<keyof ApplicationValues, FormErrorKey>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const key = field as keyof ApplicationValues;
    // Первая ошибка по полю — самая точная, дальнейшие обычно производные.
    if (!result[key]) result[key] = issue.message as FormErrorKey;
  }

  return result;
}
