/**
 * Проверка витрины на реальном браузере: адаптив, контраст, метрики скорости.
 *
 *   npm run build && npm start &
 *   node scripts/qa.mjs http://localhost:3000
 *
 * Скрипт не заменяет живой просмотр, но ловит то, что глазами замечают поздно:
 * горизонтальную прокрутку на редком разрешении, серый текст ниже порога
 * читаемости и просадку загрузки на медленном телефоне.
 */
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const LOCALES = ["ky", "ru", "en"];
const PATHS = [
  "",
  "/about",
  "/programs",
  "/teachers",
  "/admission",
  "/tuition",
  "/news",
  "/gallery",
  "/contacts",
];
const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440, 1920, 2560];

const relativeLuminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return +((hi + 0.05) / (lo + 0.05)).toFixed(2);
};

const browser = await chromium.launch({ channel: "chrome" });
let failures = 0;

// ---- 1. Горизонтальное переполнение -----------------------------------------
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();

  for (const locale of LOCALES) {
    for (const path of PATHS) {
      await page.goto(`${BASE}/${locale}${path}`, { waitUntil: "load" });
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      if (overflows) {
        console.log(`✗ страница уезжает вбок: ${width}px  /${locale}${path}`);
        failures++;
      }
    }
  }
  await context.close();
}
console.log(`адаптив: ${WIDTHS.length} ширин × ${LOCALES.length} языка × ${PATHS.length} страниц`);

// ---- 2. Контраст текста ------------------------------------------------------
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: scheme,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/ru`, { waitUntil: "load" });
  await page.waitForTimeout(300);

  /*
   * Цвета считает сам браузер на канве, а не разбор строки в Node.
   *
   * Tailwind v4 отдаёт модификатор прозрачности как `oklab(… / 0.7)`, и
   * попытка вытащить оттуда r, g, b регулярным выражением даёт мусор.
   * Канва же принимает любой валидный CSS-цвет, кладёт его поверх уже
   * нарисованного с настоящим альфа-смешением и возвращает готовый пиксель —
   * ровно тот, что увидит глаз. Полупрозрачный белый текст на полупрозрачной
   * белой подложке перестаёт выглядеть как контраст 1:1.
   */
  const samples = await page.evaluate(
    (pageBase) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const pixel = () => Array.from(ctx.getImageData(0, 0, 1, 1).data);
      const paint = (color) => {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
      };
      const alphaOf = (color) => {
        ctx.clearRect(0, 0, 1, 1);
        paint(color);
        return pixel()[3] / 255;
      };

      const read = (selector, label) => {
        const el = document.querySelector(selector);
        if (!el) return null;

        // Собираем ВСЕ полупрозрачные слои до первого непрозрачного, а не
        // первый попавшийся ненулевой: на тёмной плашке подвала над фоном
        // лежит ещё пара заливок вроде bg-white/5, и каждая из них меняет
        // итоговый цвет под текстом.
        const layers = [];
        for (let node = el; node; node = node.parentElement) {
          const background = getComputedStyle(node).backgroundColor;
          const alpha = alphaOf(background);
          if (alpha === 0) continue;
          layers.push(background);
          if (alpha === 1) break;
        }

        ctx.clearRect(0, 0, 1, 1);
        paint(pageBase);
        for (const layer of layers.reverse()) paint(layer);
        const bg = pixel().slice(0, 3);

        paint(getComputedStyle(el).color);
        const fg = pixel().slice(0, 3);

        return { label, fg, bg };
      };

      return [
        read("main a[href$='/admission']", "основная кнопка"),
        read("main p.text-lead", "лид-абзац"),
        read("main .text-kicker", "рубрика"),
        read("footer a", "ссылка в подвале"),
        read("header nav a", "пункт меню"),
      ].filter(Boolean);
      // Основа под всеми слоями — цвет страницы в этой теме.
    },
    scheme === "dark" ? "#08122a" : "#ffffff",
  );

  for (const sample of samples) {
    const ratio = contrast(sample.fg, sample.bg);
    // 4.5:1 — порог WCAG AA для основного текста.
    if (ratio < 4.5) {
      console.log(`✗ контраст ${ratio}:1 — ${sample.label} (${scheme})`);
      failures++;
    }
  }
  await context.close();
}
console.log("контраст: обе темы, порог 4.5:1");

// ---- 3. Скорость на среднем телефоне ----------------------------------------
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);

await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
// Четырёхкратное замедление процессора приближает картину к недорогому Android.
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.goto(`${BASE}/ru`, { waitUntil: "load" });
const metrics = await page.evaluate(
  () =>
    new Promise((resolve) => {
      let lcp = 0;
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });

      setTimeout(() => {
        const paint = performance.getEntriesByName("first-contentful-paint")[0];
        resolve({
          lcp: Math.round(lcp),
          cls: +cls.toFixed(4),
          fcp: Math.round(paint?.startTime ?? 0),
        });
      }, 2500);
    }),
);

console.log(
  `скорость (4G, CPU ×4): FCP ${metrics.fcp}мс · LCP ${metrics.lcp}мс · CLS ${metrics.cls}`,
);
if (metrics.lcp > 2500) {
  console.log("✗ LCP превышает 2.5 с");
  failures++;
}
if (metrics.cls > 0.1) {
  console.log("✗ CLS превышает 0.1");
  failures++;
}

await browser.close();
console.log(failures === 0 ? "\n✓ проверка пройдена" : `\n✗ замечаний: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
