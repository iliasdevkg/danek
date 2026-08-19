import { chromium } from "playwright";
const BASE = process.argv[2],
  OUT = process.argv[3];
const browser = await chromium.launch({ channel: "chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(`${BASE}/ru/programs`, { waitUntil: "load" });

// Реальная прокрутка небольшими шагами — так работает настоящий посетитель,
// в отличие от fullPage-скриншота, который растягивает вьюпорт под всю
// страницу разом и тем самым обнуляет scroll-driven анимацию.
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 500) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(80);
}
await page.waitForTimeout(300);

const visibility = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll("h2, h3")].filter(
    (el) => el.textContent.includes("Средняя школа") || el.textContent.includes("IELTS"),
  );
  return nodes.map((el) => ({
    text: el.textContent.trim(),
    opacity: getComputedStyle(el).opacity,
    rect: el.getBoundingClientRect().height,
  }));
});
console.log(JSON.stringify(visibility, null, 2));

await page.screenshot({ path: `${OUT}/programs-scrolled.png`, fullPage: true });
await browser.close();
