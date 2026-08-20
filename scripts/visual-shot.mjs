/**
 * Снимки витрины для сравнения «до/после».
 *
 *   node scripts/visual-shot.mjs http://localhost:3000 ./before
 *   …правка…
 *   node scripts/visual-shot.mjs http://localhost:3000 ./after
 *   node scripts/visual-diff.mjs ./before ./after
 *
 * Анимации глушатся дважды — через `reducedMotion` контекста и инъекцией CSS
 * после каждой навигации. Без этого бегущая строка на главной попадает в кадр
 * в случайной фазе, и любое сравнение показывает расхождение там, где вёрстка
 * не менялась вовсе. Ложная тревога в регрессионном тесте хуже его отсутствия:
 * к ней быстро привыкают и перестают смотреть на настоящие.
 */
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const OUT = process.argv[3] ?? "./shots";

const PATHS = [
  ["/ru", "home"],
  ["/ru/about", "about"],
  ["/ru/programs", "programs"],
  ["/ru/teachers", "teachers"],
  ["/ru/admission", "admission"],
  ["/ru/tuition", "tuition"],
  ["/ru/news", "news"],
  ["/ru/gallery", "gallery"],
  ["/ru/contacts", "contacts"],
  ["/ky", "home-ky"],
];

const VIEWPORTS = [
  [1440, 900, "d"],
  [768, 1024, "t"],
  [390, 844, "m"],
];

const KILL_MOTION = "*,*::before,*::after{animation:none!important;transition:none!important}";

const browser = await chromium.launch({ channel: "chrome" });

for (const [width, height, tag] of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  for (const [path, name] of PATHS) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: KILL_MOTION });

    /*
     * Сначала прокручиваем страницу до конца, потом ждём картинки.
     *
     * Порядок принципиален. Больше половины изображений на витрине ленивые:
     * пока блок не побывал в кадре, браузер даже не начинает загрузку, и
     * ожидание `img.complete` висело бы до таймаута на каждой странице.
     * А без ожидания next/image успевает показать только размытую заглушку —
     * снимок выходит наполовину в блюре, и сравнение «до/после» рапортует
     * о расхождении там, где вёрстка не менялась.
     */
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });

    await page
      .waitForFunction(
        () => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
        undefined,
        { timeout: 8000 },
      )
      .catch(() => {});

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);

    await page.screenshot({
      path: `${OUT}/${tag}-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
  await context.close();
}

console.log(`${VIEWPORTS.length * PATHS.length} снимков → ${OUT}`);
await browser.close();
