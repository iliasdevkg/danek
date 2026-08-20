import "server-only";

import { getCurrentUser } from "@/lib/auth/session";
import type { AppRole } from "@/lib/supabase/database.types";

/**
 * Проверка роли на входе в серверное действие.
 *
 * Настоящая граница доступа — это RLS в Postgres, и она никуда не девается:
 * даже если сюда кто-то не позовёт, чужие данные база не отдаст. Но без этой
 * проверки отказ приходит в виде строки от драйвера — «new row violates
 * row-level security policy» — и всплывает в тосте у растерянного человека.
 *
 * Здесь отказ происходит раньше, на понятном языке, и в одном месте, а не
 * двадцатью разными сообщениями по всем действиям.
 */
export class ForbiddenError extends Error {
  constructor() {
    super("forbidden");
    this.name = "ForbiddenError";
  }
}

/** Требует роль администратора или менеджера — «офис» в терминах политик RLS. */
export async function assertOffice(): Promise<void> {
  await assertRole("admin", "manager");
}

export async function assertRole(...roles: AppRole[]): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) throw new ForbiddenError();
}
