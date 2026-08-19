import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DANEK — school in Bishkek";

/**
 * Картинка для превью в мессенджерах и соцсетях.
 *
 * Набрана латиницей осознанно: встроенный шрифт генератора не содержит
 * кириллицы, и кыргызский заголовок превратился бы в квадраты. Логотип школы
 * латиницей — нормальная практика, а квадраты в WhatsApp — нет.
 *
 * Фон синий, а не белый: превью почти всегда показывают на белом полотне
 * переписки, и светлая картинка там расплывается в фоне. Тёмная плашка
 * с зелёным ростком читается как знак школы даже в ленте с двадцатью ссылками.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0C1C3F",
        // Те же зелёное и золотое свечения, что держат тёмные плашки на сайте.
        backgroundImage:
          "radial-gradient(900px 500px at 8% -10%, rgba(23,168,98,0.30), transparent 70%), radial-gradient(760px 440px at 98% 6%, rgba(240,168,40,0.22), transparent 68%)",
        padding: 76,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {/* Росток в круге — эмблема школы, собранная примитивами: генератор
              картинок не умеет в произвольный SVG-путь, но круг и два овала
              складываются в тот же знак. */}
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            border: "2px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", position: "relative", width: 52, height: 52 }}>
            <div
              style={{
                position: "absolute",
                left: 23,
                top: 20,
                width: 6,
                height: 32,
                borderRadius: 999,
                background: "#17A862",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 12,
                width: 26,
                height: 18,
                borderRadius: "999px 4px 999px 999px",
                background: "#17A862",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 25,
                top: 2,
                width: 27,
                height: 24,
                borderRadius: "4px 999px 999px 999px",
                background: "#FFFFFF",
                display: "flex",
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: 18,
            color: "#FFFFFF",
            display: "flex",
          }}
        >
          DANEK
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            width: 108,
            height: 6,
            background: "#F0A828",
            borderRadius: 999,
            display: "flex",
          }}
        />
        <div style={{ fontSize: 44, color: "#FFFFFF", display: "flex" }}>
          School in Bishkek · Grades 1–10
        </div>
        <div style={{ fontSize: 30, color: "rgba(255,255,255,0.62)", display: "flex" }}>
          English &amp; Arabic from grade 1 · Strong maths · IELTS &amp; ORT
        </div>
      </div>
    </div>,
    size,
  );
}

/** Три локали известны заранее — картинку можно испечь на сборке. */
export const dynamic = "force-static";
