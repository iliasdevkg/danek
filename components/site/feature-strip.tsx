import type { CSSProperties } from "react";

import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * Лесенка обещаний под обложкой.
 *
 * Пять коротких пунктов отвечают на вопрос, который родитель задаёт первым:
 * «чем эта школа отличается от соседней». Здесь нет ссылок — это не навигация,
 * а обещание, каждое из которых раскрыто ниже по странице.
 *
 * Раньше это была сетка из пяти одинаковых плиток с иконкой в углу. Она
 * работала, но выглядела ровно так же, как на любом другом школьном сайте:
 * иконка, заголовок, две строки текста, повторить пять раз. Иконки к тому же
 * лгали — «весы» рядом с математикой и «трофей» рядом с ОРТ не сообщают
 * ничего, чего не сказано словами.
 *
 * Теперь это ряд ступеней: отрезок линейки, номер на нём, заголовок,
 * пояснение. Почему именно ряд, а не вертикальный реестр с крупными
 * цифрами — расписано в `.feature-steps` (globals.css): такой реестр уже
 * стоит ниже на этой же странице, в разделе «Принципы».
 *
 * Скрывать здесь на телефоне нечего: ступень втрое ниже плитки, все пять
 * помещаются без единого нажатия.
 */
export function FeatureStrip({ t }: { t: Dictionary }) {
  const f = t.home.features;

  const items: { title: string; text: string }[] = [
    { title: f.englishTitle, text: f.englishText },
    { title: f.mathTitle, text: f.mathText },
    { title: f.mealsTitle, text: f.mealsText },
    { title: f.examsTitle, text: f.examsText },
    { title: f.careTitle, text: f.careText },
  ];

  return (
    <section className="shell" aria-labelledby="features-heading">
      {/* Заголовка у раздела нет по замыслу — обещания читаются подряд, как
          строка на афише. Но в структуре документа он обязан быть, иначе
          страница прыгает с h1 обложки сразу на h3. */}
      <h2 id="features-heading" className="sr-only">
        {f.kicker}
      </h2>

      <ol className="feature-steps grid gap-x-6 gap-y-9 sm:grid-cols-2 sm:gap-y-11 lg:grid-cols-3 xl:grid-cols-5 xl:items-start">
        {items.map((item, index) => (
          <li
            key={item.title}
            className="feature-step group pt-5"
            style={{ "--i": index } as CSSProperties}
          >
            {/* Линейка и содержимое — разные узлы: линейка чертится масштабом
                по горизонтали, содержимое оседает сверху. Одна анимация
                на двоих не смогла бы делать и то и другое. */}
            <div className="feature-body">
              {/* `ink-muted`, а не `ink-faint`: бледный тон даёт на почти
                  чёрном 3.7:1, и номер, набранный кеглем рубрики, перестаёт
                  читаться при ярком свете. Проверяется в `npm run qa`. */}
              <span
                aria-hidden="true"
                className="feature-num font-display text-kicker text-ink-muted block tabular-nums transition-colors duration-[280ms]"
              />

              <h3 className="font-display text-ink mt-3 text-[1.0625rem] leading-[1.25] font-bold tracking-[-0.01em] sm:text-[1.125rem]">
                {item.title}
              </h3>

              <p className="text-small text-ink-muted mt-2">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
