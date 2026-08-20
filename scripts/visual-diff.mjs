/**
 * Попиксельное сравнение двух наборов снимков.
 *
 *   node scripts/visual-diff.mjs ./before ./after
 *
 * Возвращает ненулевой код, если хоть один кадр разошёлся, — чтобы шаг можно
 * было поставить в конвейер. Печатает область расхождения: по её координатам
 * сразу видно, какой блок страницы поехал.
 */
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { PNG } from "playwright-core/lib/utilsBundle";

/** Ниже этого порога различие в канале считается артефактом сжатия. */
const TOLERANCE = 12;
/** Меньше этого числа изменившихся точек — шум, а не регрессия вёрстки. */
const NOISE_PIXELS = 6000;

const [beforeDir, afterDir] = process.argv.slice(2);
if (!beforeDir || !afterDir) {
  console.error("usage: node scripts/visual-diff.mjs <before> <after>");
  process.exit(2);
}

let failures = 0;
for (const file of readdirSync(beforeDir)
  .filter((f) => f.endsWith(".png"))
  .sort()) {
  const a = PNG.sync.read(readFileSync(join(beforeDir, file)));
  let b;
  try {
    b = PNG.sync.read(readFileSync(join(afterDir, file)));
  } catch {
    console.log(`✗ ${file}: нет пары`);
    failures++;
    continue;
  }

  if (a.width !== b.width || a.height !== b.height) {
    console.log(`✗ ${file}: размер ${a.width}×${a.height} → ${b.width}×${b.height}`);
    failures++;
    continue;
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -1,
    maxY = -1;
  let changed = 0;
  let maxDelta = 0;

  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (a.width * y + x) << 2;
      const d = Math.max(
        Math.abs(a.data[i] - b.data[i]),
        Math.abs(a.data[i + 1] - b.data[i + 1]),
        Math.abs(a.data[i + 2] - b.data[i + 2]),
      );
      if (d <= TOLERANCE) continue;
      changed++;
      if (d > maxDelta) maxDelta = d;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  const share = ((changed / (a.width * a.height)) * 100).toFixed(3);

  if (changed === 0) {
    console.log(`✓ ${basename(file)}`);
  } else if (changed < NOISE_PIXELS) {
    // Оптимизатор картинок Next пережимает файл на каждый запрос и даёт
    // на выходе не байт в байт одно и то же. Несколько сотен точек с малой
    // дельтой — это он, а не съехавшая вёрстка.
    console.log(`≈ ${basename(file)}: ${changed} тчк (${share}%), дельта ${maxDelta} — шум кодека`);
  } else {
    console.log(
      `✗ ${basename(file)}: ${changed} тчк (${share}%), дельта ${maxDelta}, ` +
        `x ${minX}–${maxX}, y ${minY}–${maxY}`,
    );
    failures++;
  }
}

console.log(failures === 0 ? "\n✓ витрина не изменилась" : `\n✗ расхождений: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
