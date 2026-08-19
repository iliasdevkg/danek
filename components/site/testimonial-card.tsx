import { Quote } from "lucide-react";

/**
 * Отзыв родителя.
 *
 * Кавычка стоит крупным знаком за текстом, а не перед ним: она задаёт жанр,
 * не отбирая места у самой цитаты. Подпись всегда прижата к низу карточки —
 * иначе в ряду из трёх отзывов разной длины имена вставали бы вразнобой.
 */
export function TestimonialCard({ text, author }: { text: string; author: string }) {
  return (
    <figure className="card reveal relative flex h-full flex-col gap-5 p-7 md:p-8">
      <Quote aria-hidden="true" className="text-accent-soft absolute top-6 right-6 size-10" />

      <blockquote className="text-body text-ink relative flex-1">{text}</blockquote>

      <figcaption className="border-rule flex items-center gap-3 border-t pt-5">
        <span aria-hidden="true" className="bg-gold h-px w-6 shrink-0" />
        <span className="text-small text-ink-muted font-semibold">{author}</span>
      </figcaption>
    </figure>
  );
}
