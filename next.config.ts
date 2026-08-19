import type { NextConfig } from "next";

/**
 * Хост Supabase Storage вычисляем из переменной окружения, а не хардкодим:
 * при смене проекта Supabase картинки не должны переставать оптимизироваться.
 */
const supabaseOrigin = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Протокол берём из адреса, а не пишем "https" константой: локальный
    // Supabase живёт на http://127.0.0.1:54321, и с жёстким https next/image
    // отвергал каждую фотографию из хранилища — «hostname is not configured».
    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port,
    };
  } catch {
    return null;
  }
})();

/** Локальная база — та, что слушает на этой же машине. */
const isLocalSupabase =
  supabaseOrigin !== null &&
  (supabaseOrigin.hostname === "localhost" ||
    supabaseOrigin.hostname === "127.0.0.1" ||
    supabaseOrigin.hostname === "::1");

const nextConfig: NextConfig = {
  // Автомемоизация компонентов. Тяжёлые сетки CRM (журнал, расписание)
  // перерисовываются точечно без ручных useMemo/useCallback по всему коду.
  reactCompiler: true,

  // <Link href> проверяется типами — мёртвая ссылка падает на сборке, а не у родителя.
  typedRoutes: true,

  images: {
    formats: ["image/avif", "image/webp"],
    /*
     * Оптимизатор Next отказывается ходить за картинкой на приватный адрес —
     * это защита от SSRF, и на бою она обязана работать. Но локальный Supabase
     * стоит именно там, на 127.0.0.1, и без послабления каждая фотография
     * школы в разработке отдавала 400.
     *
     * Поэтому разрешение включается ровно тогда, когда сама база локальная:
     * стоит подставить облачный адрес — защита возвращается сама, без правки
     * конфига и без шанса уехать в продакшен открытой.
     */
    dangerouslyAllowLocalIP: isLocalSupabase,
    // Фото школы живут в Supabase Storage и раздаются через оптимизатор Next.
    remotePatterns: supabaseOrigin
      ? [
          {
            protocol: supabaseOrigin.protocol,
            hostname: supabaseOrigin.hostname,
            port: supabaseOrigin.port,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    // Контент школы меняется редко — держим оптимизированные варианты 30 дней.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  experimental: {
    // Tailwind-атомарный CSS инлайнится в <head>: минус один блокирующий запрос к LCP.
    inlineCss: true,
  },
};

export default nextConfig;
