import { notFound } from "next/navigation";

import { Wordmark } from "@/components/site/wordmark";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { routes } from "@/lib/routes";

/**
 * Оболочка страниц входа/восстановления пароля.
 *
 * Не наследует шапку и подвал сайта: экран логина — не витрина, лишняя
 * навигация только путает. Минимум: логотип, форма, ссылка назад.
 */
/**
 * Типизированный LayoutProps требует одного конкретного маршрута, а эта обёртка
 * общая для /login, /forgot-password и /reset-password сразу — берём params вручную.
 */
export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);

  return (
    <div className="bg-paper-sunken grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <a href={routes.home(locale)} className="mx-auto block w-fit">
          <Wordmark name={t.meta.siteName} />
        </a>

        <div className="border-rule bg-paper-raised mt-10 rounded-md border p-7 shadow-(--shadow-overlay)">
          {children}
        </div>
      </div>
    </div>
  );
}
