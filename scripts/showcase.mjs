import { chromium } from "playwright";
const BASE = process.argv[2],
  OUT = process.argv[3];
const browser = await chromium.launch({ channel: "chrome" });

const pages = [
  { path: "/ru", name: "home" },
  { path: "/ru/about", name: "about" },
  { path: "/ru/programs", name: "programs" },
  { path: "/ru/teachers", name: "teachers" },
  { path: "/ru/admission", name: "admission" },
  { path: "/ru/tuition", name: "tuition" },
  { path: "/ru/news", name: "news" },
  { path: "/ru/gallery", name: "gallery" },
  { path: "/ru/contacts", name: "contacts" },
  { path: "/ky", name: "home-ky" },
  { path: "/en", name: "home-en" },
];

/**
 * Скролл небольшими шагами перед снимком — обязателен на страницах
 * с `.reveal` (scroll-driven анимация через animation-timeline: view()).
 * fullPage-скриншот сам по себе растягивает вьюпорт под всю страницу и тем
 * самым обнуляет прокрутку: элементы, ещё не «пройденные» реальной прокруткой,
 * остаются с opacity:0 на снимке, хотя у живого посетителя они видны.
 * Это артефакт инструмента скриншота, не баг сайта — но без этого шага
 * скриншоты обманывают, показывая пустые блоки там, где на деле есть контент.
 */
async function scrollThrough(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(70);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await desktop.newPage();
for (const { path, name } of pages) {
  await dp.goto(`${BASE}${path}`, { waitUntil: "load" });
  await scrollThrough(dp);
  await dp.screenshot({
    path: `${OUT}/site-${name}.jpg`,
    fullPage: true,
    type: "jpeg",
    quality: 72,
  });
}
await desktop.close();

const dark = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
const dkp = await dark.newPage();
await dkp.goto(`${BASE}/ru`, { waitUntil: "load" });
await scrollThrough(dkp);
await dkp.screenshot({
  path: `${OUT}/site-home-dark.jpg`,
  fullPage: true,
  type: "jpeg",
  quality: 72,
});
await dark.close();

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mp = await mobile.newPage();
for (const { path, name } of [
  { path: "/ru", name: "home" },
  { path: "/ru/admission", name: "admission" },
]) {
  await mp.goto(`${BASE}${path}`, { waitUntil: "load" });
  await scrollThrough(mp);
  await mp.screenshot({
    path: `${OUT}/site-m-${name}.jpg`,
    fullPage: true,
    type: "jpeg",
    quality: 72,
  });
}
await mobile.close();

await browser.close();
console.log("готово");
