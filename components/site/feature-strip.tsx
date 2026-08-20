import { Calculator, HeartHandshake, Languages, Trophy, UtensilsCrossed } from "lucide-react";
import type { ComponentType } from "react";

import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * Полоса преимуществ под обложкой.
 *
 * Пять коротких пунктов отвечают на вопрос, который родитель задаёт первым:
 * «чем эта школа отличается от соседней». Здесь нет ссылок — это не навигация,
 * а обещание, каждое из которых раскрыто ниже по странице.
 *
 * Раскладка — не сетка на пять колонок, а поток: на телефоне пункты идут
 * в две колонки, на планшете в три, и только на широком экране в пять.
 * Пятый пункт при этом не остаётся сиротой в конце ряда.
 */
export function FeatureStrip({ t }: { t: Dictionary }) {
  const f = t.home.features;

  const items: { icon: ComponentType<{ className?: string }>; title: string; text: string }[] = [
    { icon: Languages, title: f.englishTitle, text: f.englishText },
    { icon: Calculator, title: f.mathTitle, text: f.mathText },
    { icon: UtensilsCrossed, title: f.mealsTitle, text: f.mealsText },
    { icon: Trophy, title: f.examsTitle, text: f.examsText },
    { icon: HeartHandshake, title: f.careTitle, text: f.careText },
  ];

  return (
    <section className="shell">
      <ul className="bg-rule shadow-card grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => (
          <li
            key={item.title}
            className="fx-in group bg-paper-raised hover:bg-paper-sunken flex flex-col gap-3 p-6 transition-colors duration-[240ms]"
          >
            <span className="icon-tile group-hover:bg-accent transition-colors duration-[240ms] group-hover:text-white">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-h3 text-ink">{item.title}</h3>
            <p className="text-small text-ink-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
