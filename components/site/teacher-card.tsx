import { Photo } from "@/components/site/photo";
import { initialsOf } from "@/components/ui/avatar";
import type { TeacherCard as Teacher } from "@/lib/content/teachers";

/**
 * Карточка педагога.
 *
 * Портрет строго вертикальный и забран в арку — так лица выстраиваются
 * в ровный ряд, даже когда школа загрузила снимки разного размера, а сама
 * сетка педагогов читается как один блок, а не набор прямоугольников.
 * Нет фото — стоят инициалы на фирменном фоне, а не пустое место.
 */
export function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <article className="group text-center">
      <div className="arch bg-accent-soft shadow-card group-hover:shadow-raised relative mx-auto aspect-3/4 w-full transition-shadow duration-[320ms]">
        {teacher.photoUrl ? (
          <Photo
            src={teacher.photoUrl}
            alt={teacher.fullName}
            zoom
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 70vw"
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-display text-accent/35 grid size-full place-items-center text-5xl font-extrabold"
          >
            {initialsOf(teacher.fullName)}
          </span>
        )}
      </div>

      <h3 className="text-h3 text-ink mt-5">{teacher.fullName}</h3>
      <p className="text-small text-accent mt-1.5">{teacher.position}</p>

      {teacher.subjects.length > 0 ? (
        <p className="text-caption text-ink-faint mt-2">{teacher.subjects.join(" · ")}</p>
      ) : null}
    </article>
  );
}
