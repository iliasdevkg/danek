/**
 * Снимки вьюпорта после настоящей прокрутки.
 *
 *   npm run build && npx next start -p 3111 &
 *   node scripts/viewport-shots.mjs http://localhost:3111/ru ./shots
 *
 * Зачем отдельно от showcase.mjs: тот делает fullPage-кадры, а fullPage
 * растягивает вьюпорт под всю высоту документа. Для страницы со scroll-driven
 * анимациями (`animation-timeline: view()`) это меняет сам скроллпорт, от
 * которого анимация считает прогресс, — и блоки на снимке выглядят иначе,
 * чем у живого посетителя. Здесь вьюпорт остаётся 1440×900, а страница
 * прокручивается по-настоящему: то, что попало в кадр, человек и увидит.
 */
import { chromium } from "playwright";

const URL = process.argv[2] ?? "http://localhost:3000/ru";
const OUT = process.argv[3] ?? "./shots";
const STEP = Number(process.argv[4] ?? 800);

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.goto(URL, { waitUntil: "load" });

const height = await page.evaluate(() => document.body.scrollHeight);
let shot = 0;

for (let y = 0; y < Math.max(height - 900, 1); y += STEP) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  // Пауза длиннее одного кадра: за неё успевают доехать и наезд фотографии,
  // и появление карточек, иначе снимок ловит их на полпути.
  await page.waitForTimeout(450);
  await page.screenshot({
    path: `${OUT}/vp-${String(shot).padStart(2, "0")}.jpg`,
    type: "jpeg",
    quality: 76,
  });
  shot++;
}

console.log(`${shot} кадров, высота страницы ${height}px`);
await browser.close();
