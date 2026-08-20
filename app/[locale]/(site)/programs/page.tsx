import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenCheck, Check, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";

import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Kicker, SectionHeader } from "@/components/site/section-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getSubjects } from "@/lib/content/academics";
import { getSiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/programs">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: "programs",
    title: t.home.programs.title,
    description: t.home.programs.lead,
  });
}

/**
 * Цвет предмета задаёт администратор в CRM, поэтому в CSS он попадает только
 * после проверки: произвольная строка из базы не должна оказаться в атрибуте
 * style как есть. Не HEX — берём синий токен, и чип выглядит как обычный.
 */
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function subjectTint(color: string): string {
  return HEX_COLOR.test(color) ? color : "var(--accent)";
}

/**
 * Оттенок чипа считается от цвета предмета прямо в CSS.
 *
 * Значения идут инлайном, а не утилитами Tailwind, по двум причинам: цвет
 * известен только в рантайме, и только инлайн гарантированно перебивает
 * собственные background/color утилиты `chip`. Подмешивание к токенам
 * (`--paper-raised`, `--rule`, `--ink`) вместо готовых оттенков — чтобы тот же
 * зелёный читался и на белом листе, и на тёмной теме: контраст берётся от
 * текущей поверхности, а не от захардкоженного фона.
 */
function subjectChipStyle(color: string): CSSProperties {
  const tint = subjectTint(color);
  return {
    backgroundColor: `color-mix(in oklab, ${tint} 9%, var(--paper-raised))`,
    borderColor: `color-mix(in oklab, ${tint} 45%, var(--rule))`,
    color: "var(--ink)",
  };
}

function subjectDotStyle(color: string): CSSProperties {
  return { backgroundColor: `color-mix(in oklab, ${subjectTint(color)} 70%, var(--ink))` };
}

export default async function ProgramsPage({ params }: PageProps<"/[locale]/programs">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, contacts, subjects] = await Promise.all([
    getDictionary(locale),
    getSiteContacts(),
    getSubjects(locale),
  ]);

  const p = t.home.programs;
  const page = t.programsPage;

  const stages = [
    {
      id: "stage-primary",
      ...p.primary,
      detail: page.primaryDetail,
      image: STOCK_IMAGES.programsPrimary,
    },
    {
      id: "stage-middle",
      ...p.middle,
      detail: page.middleDetail,
      image: STOCK_IMAGES.programsMiddle,
    },
    {
      id: "stage-senior",
      ...p.senior,
      detail: page.seniorDetail,
      image: STOCK_IMAGES.programsPrep,
    },
  ];

  const prepPoints = [page.prepPointOne, page.prepPointTwo, page.prepPointThree];

  return (
    <>
      <PageHero
        locale={locale}
        t={t}
        kicker={p.kicker}
        title={p.title}
        lead={p.lead}
        image={STOCK_IMAGES.programsMiddle}
        imageAlt={page.prepImageAlt}
        aside={
          // Страница длинная и состоит из трёх почти равных разворотов —
          // без якорей родитель, которому нужен конкретный класс, скроллит
          // вслепую. Обычные ссылки на #id: ноль JS, работает и без гидратации.
          <nav aria-label={page.stagesNavLabel} className="card p-5">
            <ul className="divide-rule flex flex-col divide-y">
              {stages.map((stage) => (
                <li key={stage.id}>
                  <a
                    href={`#${stage.id}`}
                    className="group flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                  >
                    <span>
                      <span className="text-caption text-ink-faint block">{stage.grades}</span>
                      <span className="text-small text-ink group-hover:text-accent block font-semibold transition-colors duration-[180ms]">
                        {stage.title}
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="text-ink-faint group-hover:text-accent size-4 shrink-0 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        }
      />

      {/* ------------------------------------------------------------ Ступени */}
      <section className="shell section-t">
        <div className="flex flex-col gap-16 md:gap-24 lg:gap-28">
          {stages.map((stage, index) => {
            // Стороны меняются местами через строку: глаз получает ритм
            // разворота журнала вместо трёх одинаковых полос подряд.
            const flipped = index % 2 === 1;

            return (
              <article
                key={stage.id}
                id={stage.id}
                className="fx-in grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16"
              >
                {/*
                 * Все кадры ступеней теперь одинаково прямоугольные.
                 * Купол читался как украшение и был главной приметой мягкой,
                 * «детской» подачи; в кинематографическом развороте работает
                 * сам снимок, а не форма его рамки.
                 *
                 * Внутренний слой едет параллаксом, пока строка проходит мимо, —
                 * считает это прокрутка, а не обработчик в JS.
                 */}
                <figure className={cn("fx-mask", flipped && "lg:order-2")}>
                  <div className="bg-paper-sunken relative aspect-4/3 w-full overflow-hidden rounded-xs">
                    <div className="fx-parallax absolute inset-[-14%]">
                      <Photo
                        src={stage.image}
                        alt={stage.imageAlt}
                        sizes="(min-width: 1024px) 46vw, 90vw"
                      />
                    </div>
                  </div>
                </figure>

                <div className={cn(flipped && "lg:order-1")}>
                  <span className="chip">{stage.grades}</span>

                  <h2 className="text-h2 text-ink mt-5">{stage.title}</h2>
                  <p className="text-lead text-ink mt-5">{stage.text}</p>

                  {/* Зелёная черта — тот же росток с эмблемы: подробность
                      про ступень отделена от обещания, но не оторвана. */}
                  <p className="border-brand/45 text-body text-ink-muted mt-6 border-l-2 pl-5">
                    {stage.detail}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------- Предметы */}
      <section className="shell section-t">
        <SectionHeader
          kicker={page.subjectsKicker}
          title={page.subjectsTitle}
          lead={page.subjectsLead}
        />

        {subjects.length > 0 ? (
          <ul className="fx-in mt-10 flex flex-wrap gap-2.5">
            {subjects.map((subject) => (
              <li key={subject.id} className="chip border" style={subjectChipStyle(subject.color)}>
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full"
                  style={subjectDotStyle(subject.color)}
                />
                {subject.name}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className="mt-10"
            icon={<BookOpenCheck className="size-7" aria-hidden="true" />}
            title={page.subjectsEmptyTitle}
            description={page.subjectsEmpty}
            action={
              <Link
                href={routes.contacts(locale)}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                {page.ctaAction}
              </Link>
            }
          />
        )}
      </section>

      {/* ------------------------------------------- Подготовка к экзаменам */}
      <section className="section-t">
        <div className="shell">
          <div
            className="surface-dark relative overflow-hidden rounded-2xl px-6 py-14 md:px-12 md:py-16"
            data-surface="dark"
          >
            <div aria-hidden="true" className="deco-dots absolute inset-0 text-white" />

            <div className="relative grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <figure className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-white/5 lg:col-span-5">
                <Photo
                  src={STOCK_IMAGES.prepStudents}
                  alt={page.prepImageAlt}
                  sizes="(min-width: 1024px) 40vw, 90vw"
                />
              </figure>

              <div className="lg:col-span-6 lg:col-start-7">
                <Kicker tone="inverse">{page.prepKicker}</Kicker>
                <h2 className="text-h2 mt-4 text-white">{page.prepTitle}</h2>
                <p className="text-lead mt-4 text-white/70">{page.prepText}</p>

                <ul className="mt-8 flex flex-col gap-3">
                  {prepPoints.map((point) => (
                    <li key={point} className="text-body flex items-start gap-3 text-white">
                      <span className="bg-brand-bright/15 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full">
                        <Check className="text-brand-bright size-3.5" aria-hidden="true" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Выбор класса */}
      <section className="shell section-t">
        <div className="bg-paper-sunken rounded-2xl px-6 py-12 md:px-12 md:py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
            <div className="max-w-2xl">
              <Kicker>{page.ctaKicker}</Kicker>
              <h2 className="text-h2 text-ink mt-4">{page.ctaTitle}</h2>
              <p className="text-lead text-ink-muted mt-4">{page.ctaText}</p>
            </div>

            {/* Кнопка намеренно не золотая: золото на сайте означает «здесь
                начинается приём», и оно ждёт ниже, в приглашении. Здесь
                следующий шаг другой — разговор о классе. */}
            <Link
              href={routes.contacts(locale)}
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "shrink-0",
              })}
            >
              {page.ctaAction}
            </Link>
          </div>
        </div>
      </section>

      <CtaBand locale={locale} t={t} contacts={contacts} />
    </>
  );
}
