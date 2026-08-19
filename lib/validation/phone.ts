/**
 * Приведение кыргызского номера к единому виду +996XXXXXXXXX.
 *
 * Родители пишут номер как привыкли: 0700 12 34 56, 996700123456, +996 700…
 * Все эти формы — один и тот же человек, и в базе они обязаны совпасть,
 * иначе антиспам и поиск по номеру в CRM работать не будут.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("996")) return `+${digits}`;
  // Местная запись с ведущим нулём: 0700123456
  if (digits.length === 10 && digits.startsWith("0")) return `+996${digits.slice(1)}`;
  // Номер без кода страны: 700123456
  if (digits.length === 9) return `+996${digits}`;

  return input.trim();
}

export function isValidKgPhone(value: string): boolean {
  return /^\+996[0-9]{9}$/.test(value);
}
