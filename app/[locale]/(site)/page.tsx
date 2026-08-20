import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Globe2,
  Languages,
  ListChecks,
  Medal,
  MessagesSquare,
  Quote,
  Sparkles,
  UserRoundCheck,
  Users,
} from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { FeatureStrip } from "@/components/site/feature-strip";
import { HomeHero } from "@/components/site/home-hero";
import { NewsCard } from "@/components/site/news-card";
import { Photo } from "@/components/site/photo";
import { ProgramCard } from "@/components/site/program-card";
import { ShowMore } from "@/components/site/show-more";
import { SchoolLife } from "@/components/site/school-life";
import { Kicker, SectionHeader } from "@/components/site/section-header";
import { TeacherCard } from "@/components/site/teacher-card";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { ValueMarquee } from "@/components/site/value-marquee";
import { buttonVariants } from "@/components/ui/button";
import { getPublishedNews } from "@/lib/content/news";
import { getSiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { getPublicTeachers } from "@/lib/content/teachers";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Всё грузится параллельно: страница статическая, но пересборка не должна
  // ждать четыре последовательных запроса.
  const [t, contacts, teachers, news] = await Promise.all([
    getDictionary(locale),
    getSiteContacts(),
    getPublicTeachers(locale, 4),
    getPublishedNews(locale, 3),
  ]);

  const home = t.home;

  const stages = [
    {
      ...home.programs.primary,
      image: STOCK_IMAGES.programsPrimary,
      href: routes.programs(locale),
    },
    {
      ...home.programs.middle,
      image: STOCK_IMAGES.programsMiddle,
      href: routes.programs(locale),
    },
    {
      ...home.programs.senior,
      image: STOCK_IMAGES.programsPrep,
      href: routes.programs(locale),
    },
  ];

  const principles: { icon: ComponentType<{ className?: string }>; title: string; text: string }[] =
    [
      {
        icon: BookOpenCheck,
        title: home.principles.smallClassesTitle,
        text: home.principles.smallClassesText,
      },
      {
        icon: UserRoundCheck,
        title: home.principles.gradesTitle,
        text: home.principles.gradesText,
      },
      {
        icon: ListChecks,
        title: home.principles.languagesTitle,
        text: home.principles.languagesText,
      },
      { icon: Medal, title: home.principles.fullDayTitle, text: home.principles.fullDayText },
      {
        icon: MessagesSquare,
        title: home.principles.parentsTitle,
        text: home.principles.parentsText,
      },
      { icon: Users, title: home.principles.safetyTitle, text: home.principles.safetyText },
    ];

  const achievements: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    text: string;
  }[] = [
    { icon: Medal, title: home.achievements.olympiadTitle, text: home.achievements.olympiadText },
    { icon: Languages, title: home.achievements.ieltsTitle, text: home.achievements.ieltsText },
    { icon: GraduationCap, title: home.achievements.ortTitle, text: home.achievements.ortText },
    { icon: Globe2, title: home.achievements.abroadTitle, text: home.achievements.abroadText },
  ];

  const testimonials = [
    { text: home.testimonials.oneText, author: home.testimonials.oneAuthor },
    { text: home.testimonials.twoText, author: home.testimonials.twoAuthor },
    { text: home.testimonials.threeText, author: home.testimonials.threeAuthor },
  ];

  const faq = [
    { question: home.faq.q1, answer: home.faq.a1 },
    { question: home.faq.q2, answer: home.faq.a2 },
    { question: home.faq.q3, answer: home.faq.a3 },
    { question: home.faq.q4, answer: home.faq.a4 },
    { question: home.faq.q5, answer: home.faq.a5 },
    { question: home.faq.q6, answer: home.faq.a6 },
  ];

  const manifestoPoints = [
    { value: home.manifesto.pointOneValue, label: home.manifesto.pointOneLabel },
    { value: home.manifesto.pointTwoValue, label: home.manifesto.pointTwoLabel },
    { value: home.manifesto.pointThreeValue, label: home.manifesto.pointThreeLabel },
  ];

  return (
    <>
      <HomeHero locale={locale} t={t} contacts={contacts} />

      {/* ------------------------------------------------------ Преимущества */}
      <FeatureStrip t={t} />

      {/* ------------------------------------------------------------ О школе */}
      <section className="shell section-t">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Коллаж: крупный кадр и перекрывающий его угол квадратом. Тот же
              приём, что на обложке, — раздел читается как продолжение
              разговора, а не как новый разворот. */}
          <div className="relative lg:col-span-5">
            {/* Кадр раскрывается снизу вверх, а его содержимое едет параллаксом:
                внутренний слой намеренно больше рамки на 14% с каждой стороны,
                иначе сдвиг обнажил бы край фотографии. */}
            <figure className="fx-mask bg-paper-sunken relative aspect-4/3 w-full overflow-hidden rounded-xs sm:aspect-4/5">
              <div className="fx-parallax absolute inset-[-14%]">
                <Photo
                  src={STOCK_IMAGES.aboutMission}
                  alt={home.manifesto.imageAlt}
                  sizes="(min-width: 1024px) 38vw, 90vw"
                />
              </div>
            </figure>

            <figure className="border-paper bg-paper-sunken shadow-float absolute -right-3 -bottom-8 hidden aspect-square w-40 overflow-hidden rounded-2xl border-4 sm:block md:w-48 lg:-right-8">
              <Photo
                src={STOCK_IMAGES.aboutLibrary}
                alt={home.manifesto.secondImageAlt}
                sizes="192px"
              />
            </figure>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Kicker>{home.manifesto.kicker}</Kicker>
            <h2 className="text-h2 text-ink mt-4">{home.manifesto.title}</h2>

            <p className="text-lead text-ink mt-5 sm:mt-6">{home.manifesto.bodyFirst}</p>
            <p className="text-body text-ink-muted mt-4">{home.manifesto.bodySecond}</p>

            <dl className="border-rule mt-7 grid grid-cols-3 gap-4 border-y py-5 sm:mt-9 sm:py-6">
              {manifestoPoints.map((point) => (
                <div key={point.label} className="flex flex-col gap-1">
                  <dt className="text-caption text-ink-muted order-2">{point.label}</dt>
                  <dd
                    className="font-display text-h2 text-accent order-1 leading-none"
                    data-numeric
                  >
                    {point.value}
                  </dd>
                </div>
              ))}
            </dl>

            <blockquote className="border-gold bg-gold-soft/60 mt-6 rounded-xl border-l-4 py-5 pr-5 pl-6 sm:mt-8">
              {/* Кавычки не вшиты в разметку: их рисует базовый стиль `q` по
                  языку страницы — «ёлочки» для ru/ky, “лапки” для en. */}
              <p className="font-display text-h3 text-ink">
                <q>{home.manifesto.quote}</q>
              </p>
              <footer className="text-caption text-ink-muted mt-3">
                {home.manifesto.quoteAuthor}
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Программы */}
      {/*
       * Чередование подложек задаёт странице главы: белое — тонированное —
       * белое — тёмное. Без него десять разделов подряд на белом сливаются
       * в одну ленту, и понять, где закончилась мысль, можно только по тексту.
       */}
      <section className="surface-tint section-y">
        <div className="shell">
          <SectionHeader
            kicker={home.programs.kicker}
            title={home.programs.title}
            lead={home.programs.lead}
            action={
              <Link
                href={routes.programs(locale)}
                className={buttonVariants({ variant: "secondary" })}
              >
                {home.programs.cta}
              </Link>
            }
          />

          {/*
           * На широком экране ступени собираются стопкой: каждая следующая
           * карточка останавливается чуть ниже предыдущей и накрывает её.
           * Это чистый `position: sticky` — ни анимации, ни обработчика,
           * ни единого килобайта скриптов; смещение задаёт переменная `--i`.
           *
           * Приём работает только там, где карточки идут в столбик и у страницы
           * есть куда прокручиваться, поэтому на планшете и телефоне остаётся
           * обычная сетка: три липких блока на коротком экране просто
           * перекрыли бы друг друга и спрятали содержимое.
           */}
          <ShowMore
            id="more-stages"
            label={t.common.showMore}
            visible={2}
            className="mt-8 sm:mt-12"
            itemsClassName="grid gap-6 md:grid-cols-3 lg:block lg:gap-0 lg:space-y-6"
          >
            {stages.map((stage, index) => (
              <div
                key={stage.title}
                className="lg:fx-stack"
                style={{ "--i": index } as CSSProperties}
              >
                <ProgramCard
                  layout="wide"
                  grades={stage.grades}
                  title={stage.title}
                  text={stage.text}
                  image={stage.image}
                  imageAlt={stage.imageAlt}
                  href={stage.href}
                  more={home.programs.more}
                />
              </div>
            ))}
          </ShowMore>
        </div>
      </section>

      {/* ---------------------------------------------------- Бегущая строка */}
      <div className="mt-16 md:mt-24">
        <ValueMarquee t={t} />
      </div>

      {/* ----------------------------------------------------------- Принципы */}
      {/*
       * Раздел намеренно свёрстан не карточками, а списком.
       *
       * Выше по странице уже трижды подряд идёт сетка карточек — преимущества,
       * ступени, мозаика. Четвёртая читалась бы как продолжение предыдущей,
       * и глаз переставал бы различать, где кончается один разговор и
       * начинается другой. Здесь вместо рамок работают крупная цифра,
       * волосяная линейка и воздух: тот же материал, другая интонация.
       *
       * Заголовок стоит слева и не уезжает при прокрутке на узких экранах —
       * `lg:sticky` включается только там, где рядом с ним есть что листать.
       */}
      <section className="surface-tint section-y">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Kicker>{home.principles.kicker}</Kicker>
              <h2 className="text-h2 text-ink mt-4">{home.principles.title}</h2>
            </div>
          </div>

          <ShowMore
            id="more-principles"
            label={t.common.showMore}
            className="lg:col-span-7 lg:col-start-6"
            as="ol"
          >
            {principles.map((item, index) => (
              <li
                key={item.title}
                className="fx-in border-rule group flex gap-5 border-b py-7 first:border-t sm:gap-8"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-ink-faint/45 group-hover:text-gold w-12 shrink-0 text-[2.5rem] leading-none tabular-nums transition-colors duration-[320ms] sm:w-16 sm:text-[3.25rem]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex-1">
                  <h3 className="text-h3 text-ink flex items-start gap-3">
                    <item.icon className="text-brand mt-1 size-5 shrink-0" aria-hidden="true" />
                    {item.title}
                  </h3>
                  <p className="text-small text-ink-muted mt-2.5">{item.text}</p>
                </div>
              </li>
            ))}
          </ShowMore>
        </div>
      </section>

      {/* -------------------------------------------------------- Жизнь школы */}
      <section className="shell section-t">
        <SectionHeader
          kicker={home.life.kicker}
          title={home.life.title}
          lead={home.life.lead}
          action={
            <Link
              href={routes.gallery(locale)}
              className={buttonVariants({ variant: "secondary" })}
            >
              {home.life.cta}
            </Link>
          }
        />

        <SchoolLife t={t} />
      </section>

      {/* ----------------------------------------------------------- Результат */}
      <section className="section-t">
        <div className="shell">
          <div
            className="surface-dark relative overflow-hidden rounded-2xl px-6 py-14 text-white md:px-12 md:py-16"
            data-surface="dark"
          >
            <div aria-hidden="true" className="deco-dots absolute inset-0 text-white" />

            <div className="relative">
              <SectionHeader
                kicker={home.achievements.kicker}
                title={home.achievements.title}
                lead={home.achievements.lead}
                align="center"
                tone="inverse"
              />

              <ShowMore
                id="more-achievements"
                label={t.common.showMore}
                visible={2}
                as="ul"
                className="mt-8 sm:mt-12"
                itemsClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                {achievements.map((item) => (
                  <li
                    key={item.title}
                    className="fx-in rounded-xl border border-white/12 bg-white/5 p-6 transition-colors duration-[240ms] hover:border-white/25 hover:bg-white/10"
                  >
                    <span className="icon-tile bg-gold/15 text-gold">
                      <item.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-h3 mt-5 text-white">{item.title}</h3>
                    <p className="text-small mt-2.5 text-white/65">{item.text}</p>
                  </li>
                ))}
              </ShowMore>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Педагоги */}
      {teachers.length > 0 ? (
        <section className="shell section-t">
          <SectionHeader
            kicker={home.teachers.kicker}
            title={home.teachers.title}
            lead={home.teachers.lead}
            action={
              <Link
                href={routes.teachers(locale)}
                className={buttonVariants({ variant: "secondary" })}
              >
                {home.teachers.cta}
              </Link>
            }
          />

          <ShowMore
            id="more-teachers"
            label={t.common.showMore}
            visible={2}
            className="mt-8 sm:mt-12"
            itemsClassName="teacher-grid grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4"
          >
            {teachers.map((teacher) => (
              <div key={teacher.id} className="fx-in">
                <TeacherCard teacher={teacher} />
              </div>
            ))}
          </ShowMore>
        </section>
      ) : null}

      {/* -------------------------------------------------------------- Отзывы */}
      {/*
       * Первый отзыв набран крупно и стоит один, остальные — рядом помельче.
       *
       * Три равные карточки заставляют читать все три или не читать ни одной:
       * взгляд не знает, с какой начать. Здесь порядок задан размером —
       * сначала одна фраза, набранная так, что её нельзя пропустить, потом
       * два подтверждения. Это тот же материал, но прочитанным оказывается
       * хотя бы первый.
       */}
      <section className="shell section-t">
        <SectionHeader
          kicker={home.testimonials.kicker}
          title={home.testimonials.title}
          lead={home.testimonials.lead}
        />

        <div className="mt-8 grid items-start gap-6 sm:mt-12 lg:grid-cols-12">
          {/* Крупная цитата стоит на золотой подложке: это единственное место
              на странице, где золото красит не действие, а слово родителя —
              и потому не спорит с кнопкой «Подать заявку». */}
          <figure className="fx-in border-gold/25 bg-gold-soft/45 relative flex flex-col gap-6 rounded-2xl border p-6 sm:gap-8 sm:p-8 lg:col-span-7 lg:p-12">
            <Quote
              aria-hidden="true"
              className="text-gold/25 absolute top-8 right-8 size-20 lg:size-28"
            />
            <blockquote className="font-display text-ink relative pr-14 text-[clamp(1.375rem,1rem+1.5vw,2rem)] leading-[1.25] font-bold tracking-[-0.03em] lg:pr-24">
              {testimonials[0].text}
            </blockquote>
            <figcaption className="border-gold/20 flex items-center gap-3 border-t pt-6">
              <span aria-hidden="true" className="bg-gold h-px w-8 shrink-0" />
              <span className="text-small text-ink-muted font-semibold">
                {testimonials[0].author}
              </span>
            </figcaption>
          </figure>

          <ShowMore
            id="more-testimonials"
            label={t.common.showMore}
            visible={1}
            className="lg:col-span-5"
            itemsClassName="grid gap-6"
          >
            {testimonials.slice(1).map((item) => (
              <TestimonialCard key={item.author} text={item.text} author={item.author} />
            ))}
          </ShowMore>
        </div>
      </section>

      {/* ------------------------------------------------------------- Новости */}
      {news.length > 0 ? (
        <section className="shell section-t">
          <SectionHeader
            kicker={home.news.kicker}
            title={home.news.title}
            action={
              <Link href={routes.news(locale)} className={buttonVariants({ variant: "secondary" })}>
                {home.news.cta}
              </Link>
            }
          />

          <ShowMore
            id="more-news"
            label={t.common.showMore}
            visible={2}
            className="mt-8 sm:mt-12"
            itemsClassName="grid gap-6 md:grid-cols-3"
          >
            {news.map((item) => (
              <NewsCard key={item.id} item={item} locale={locale} more={t.common.more} />
            ))}
          </ShowMore>
        </section>
      ) : null}

      {/* ----------------------------------------------------------------- FAQ */}
      <section className="shell section-t">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <Kicker>{home.faq.kicker}</Kicker>
            <h2 className="text-h2 text-ink mt-3 sm:mt-4">{home.faq.title}</h2>

            <div className="mt-8 hidden lg:block">
              <Link
                href={routes.admission(locale)}
                className={buttonVariants({ variant: "gold", className: "group" })}
              >
                {t.nav.apply}
                <ArrowRight
                  className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <p className="text-small text-ink-faint mt-6 hidden items-center gap-2 lg:flex">
              <Sparkles className="text-gold size-4" aria-hidden="true" />
              {home.invite.note}
            </p>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <FaqList items={faq} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Приглашение */}
      <CtaBand locale={locale} t={t} contacts={contacts} />
    </>
  );
}
