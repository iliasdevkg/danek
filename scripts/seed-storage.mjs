/**
 * Заливка демонстрационных фотографий в бакет media.
 *
 *   node scripts/seed-storage.mjs
 *
 * Зачем отдельным скриптом, а не строкой в seed.sql: в базе лежат только пути,
 * сами файлы живут в хранилище, а SQL туда положить ничего не может. Без этого
 * шага сайт после подключения Supabase показывал бы битые картинки — пути есть,
 * файлов нет.
 *
 * Ключи берутся из .env.local. Нужен служебный ключ: политики хранилища
 * разрешают запись только сотрудникам, а у скрипта нет сессии.
 *
 * Повторный запуск безопасен: файлы заливаются с upsert.
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

const ROOT = new URL("..", import.meta.url).pathname;

// Читаем .env.local вручную: скрипт запускается через node, без загрузчика Next.
const env = Object.fromEntries(
  (await readFile(join(ROOT, ".env.local"), "utf8"))
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => {
      const at = line.indexOf("=");
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("В .env.local нет NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Куда какая папка едет.
 *
 * Префикс в хранилище повторяет то, что записано в seed.sql: `site/` для
 * витрины, `teachers/` для портретов. Имя файла не меняется — так по пути
 * в базе сразу видно, какой это снимок.
 */
const SOURCES = [
  { dir: "assets/images", prefix: "site/", rename: (name) => name },
  { dir: "assets/images/life", prefix: "site/", rename: (name) => `life-${name}` },
  { dir: "assets/images/teachers", prefix: "teachers/", rename: (name) => name },
];

let uploaded = 0;
let failed = 0;

for (const source of SOURCES) {
  const entries = await readdir(join(ROOT, source.dir), { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".jpg")) continue;

    const path = source.prefix + source.rename(entry.name);
    const body = await readFile(join(ROOT, source.dir, entry.name));

    const { error } = await supabase.storage.from("media").upload(path, body, {
      contentType: "image/jpeg",
      upsert: true,
    });

    if (error) {
      console.error(`✗ ${path}: ${error.message}`);
      failed++;
    } else {
      uploaded++;
    }
  }
}

console.log(`Загружено ${uploaded} файлов в бакет media${failed ? `, ошибок: ${failed}` : ""}.`);
process.exit(failed === 0 ? 0 : 1);
