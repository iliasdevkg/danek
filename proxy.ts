import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE, isLocale, resolveLocale } from "@/lib/i18n/config";
import { canAccessArea, homePathForRole, isAppArea, roleFromClaims } from "@/lib/auth/roles";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

const AUTH_ROUTES = new Set(["login", "forgot-password", "reset-password"]);

/**
 * Proxy решает ровно две задачи и намеренно не берёт на себя третью.
 *
 *  1. Приводит любой путь к виду /{locale}/…
 *  2. За логином продлевает сессию Supabase и заворачивает чужих.
 *
 * На публичных страницах он выходит немедленно и не ставит ни одной cookie:
 * заголовок Set-Cookie сделал бы статические ответы некэшируемыми на CDN,
 * а витрина обязана раздаваться с края сети.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  // ---- 1. Локаль в адресе -------------------------------------------------
  if (!isLocale(maybeLocale)) {
    const locale = resolveLocale(
      request.cookies.get(LOCALE_COOKIE)?.value,
      request.headers.get("accept-language"),
    );

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

    // Именно 307, а не 308: выбор языка зависит от посетителя, и постоянный
    // редирект намертво осел бы в кэше браузера первого же гостя.
    return NextResponse.redirect(url, 307);
  }

  const locale = maybeLocale;
  const area = segments[2];
  const isProtected = isAppArea(area);
  const isAuthRoute = AUTH_ROUTES.has(area ?? "");

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  /*
   * Стенд без базы: кабинет физически не может работать.
   *
   * Раньше запрос просто пропускался дальше, страница дёргала Supabase и
   * падала пятисоткой — посетитель видел системную ошибку вместо объяснения.
   * Теперь защищённые разделы уводят на страницу входа, а она честно говорит,
   * что кабинет ещё не подключён. Сама страница входа при этом открывается:
   * иначе объяснению негде было бы появиться.
   */
  if (!isSupabaseConfigured) {
    if (isAuthRoute) return NextResponse.next();
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // ---- 2. Сессия ----------------------------------------------------------
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser(), а не getSession(): подпись токена проверяется на сервере Supabase,
  // поэтому подделанная cookie не пройдёт.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user ? roleFromClaims(user.app_metadata) : null;

  if (isAuthRoute) {
    // Вошедшего не держим на странице логина.
    if (user) {
      return NextResponse.redirect(new URL(homePathForRole(role, locale), request.url));
    }
    return response;
  }

  if (!user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    // Запомнили куда шли — после входа вернём туда же, а не на дашборд.
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessArea(role, area)) {
    return NextResponse.redirect(new URL(homePathForRole(role, locale), request.url));
  }

  return response;
}

export const config = {
  // Пропускаем api, служебные пути Next и всё, что похоже на файл с расширением
  // (favicon.ico, sitemap.xml, robots.txt, картинки из public).
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
