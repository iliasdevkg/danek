import { Photo } from "@/components/site/photo";
import { initialsOf } from "@/components/ui/avatar";
import type { TeacherCard as Teacher } from "@/lib/content/teachers";

/**
 * Карточка педагога.
 *
 * Кадр прямоугольный, со скруглением в два пикселя — тем же, что у всех
 * остальных снимков витрины. Круглые и арочные рамки отсюда убраны: мягкий
 * угол читается как «детское», а этот сайт держится ровно на обратном.
 *
 * Все кадры одной пропорции и одного роста: ряд лиц должен читаться как ряд,
 * а не как набор по-разному обрезанных снимков.
 *
 * Нет фото — стоят инициалы на фирменном фоне, а не пустое место: ряд не
 * должен разваливаться из-за того, что у одного человека снимок ещё
 * не загружен.
 *
 * Подпись выровнена по левому краю, а не по центру, и отчёркнута короткой
 * чертой. Центрированная подпись под фотографией — подпись из шаблона;
 * левый край и черта превращают её в титр.
 *
 * Всё, что известно о человеке, видно сразу: имя, должность, предметы.
 * Наведение только усиливает — наезжает кадр и вырастает черта. Прятать
 * что-либо под курсор здесь нельзя: на телефоне курсора нет, а карточка
 * не ссылка, и раскрыть её нажатием тоже нельзя.
 */
export function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <article className="group">
      <div className="bg-accent-soft shadow-card group-hover:shadow-raised relative aspect-5/7 w-full overflow-hidden rounded-xs transition-shadow duration-[320ms]">
        {teacher.photoUrl ? (
          <Photo
            src={teacher.photoUrl}
            alt={teacher.fullName}
            zoom
            className="portrait-reveal"
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

      <div className="mt-4 flex items-start gap-2.5 sm:gap-3">
        {/* Черта растёт масштабом, а не шириной: ширина — это раскладка,
            и её пересчёт на восьми карточках сразу заметен на недорогом
            телефоне. Масштаб живёт в композиторе и не стоит ничего. */}
        <span
          aria-hidden="true"
          className="bg-accent mt-2.5 h-px w-5 shrink-0 origin-left scale-x-50 transition-transform duration-[380ms] ease-(--ease-entrance) group-hover:scale-x-100 sm:w-8"
        />

        <div className="min-w-0">
          <h3 className="text-h3 text-ink">{teacher.fullName}</h3>

          {/* Должность не капслоком: «руководитель направления „английский
              язык“» набирается тремя строками прописных и превращается
              в крик. Титр здесь держит черта слева, а не регистр. */}
          <p className="text-small text-ink-muted mt-1.5">{teacher.position}</p>

          {teacher.subjects.length > 0 ? (
            <p className="text-caption text-ink-faint mt-2">{teacher.subjects.join(" · ")}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
