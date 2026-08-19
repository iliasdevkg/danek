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
  Sparkles,
  UserRoundCheck,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { FeatureStrip } from "@/components/site/feature-strip";
import { HomeHero } from "@/components/site/home-hero";
import { NewsCard } from "@/components/site/news-card";
import { Photo } from "@/components/site/photo";
import { ProgramCard } from "@/components/site/program-card";
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
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Коллаж: крупная арка и перекрывающий её угол квадратом. Тот же
              приём, что на обложке, — раздел читается как продолжение
              разговора, а не как новый разворот. */}
          <div className="relative lg:col-span-5">
            <figure className="arch reveal-zoom bg-paper-sunken shadow-raised relative aspect-4/5 w-full">
              <Photo
                src={STOCK_IMAGES.aboutMission}
                alt={home.manifesto.imageAlt}
                sizes="(min-width: 1024px) 38vw, 90vw"
              />
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

            <p className="text-lead text-ink mt-6">{home.manifesto.bodyFirst}</p>
            <p className="text-body text-ink-muted mt-4">{home.manifesto.bodySecond}</p>

            <dl className="border-rule mt-9 grid grid-cols-3 gap-4 border-y py-6">
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

            <blockquote className="border-gold bg-gold-soft/60 mt-8 rounded-xl border-l-4 py-5 pr-5 pl-6">
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
      <section className="shell section-t">
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

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stages.map((stage) => (
            <ProgramCard
              key={stage.title}
              grades={stage.grades}
              title={stage.title}
              text={stage.text}
              image={stage.image}
              imageAlt={stage.imageAlt}
              href={stage.href}
              more={home.programs.more}
            />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- Бегущая строка */}
      <div className="mt-16 md:mt-24">
        <ValueMarquee t={t} />
      </div>

      {/* ----------------------------------------------------------- Принципы */}
      <section className="shell section-t">
        <SectionHeader
          kicker={home.principles.kicker}
          title={home.principles.title}
          align="center"
        />

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((item, index) => (
            <li key={item.title} className="card hover-lift reveal group relative p-7">
              <span
                aria-hidden="true"
                className="font-display text-h2 text-accent-soft absolute top-6 right-7 leading-none tabular-nums"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="icon-tile group-hover:bg-accent transition-colors duration-[240ms] group-hover:text-white">
                <item.icon className="size-5" aria-hidden="true" />
              </span>

              <h3 className="text-h3 text-ink mt-5 max-w-[85%]">{item.title}</h3>
              <p className="text-small text-ink-muted mt-2.5">{item.text}</p>
            </li>
          ))}
        </ol>
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

              <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {achievements.map((item) => (
                  <li
                    key={item.title}
                    className="reveal-sm rounded-xl border border-white/12 bg-white/5 p-6 transition-colors duration-[240ms] hover:border-white/25 hover:bg-white/10"
                  >
                    <span className="icon-tile bg-gold/15 text-gold">
                      <item.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-h3 mt-5 text-white">{item.title}</h3>
                    <p className="text-small mt-2.5 text-white/65">{item.text}</p>
                  </li>
                ))}
              </ul>
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

          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="reveal">
                <TeacherCard teacher={teacher} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------------- Отзывы */}
      <section className="shell section-t">
        <SectionHeader
          kicker={home.testimonials.kicker}
          title={home.testimonials.title}
          lead={home.testimonials.lead}
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard key={item.author} text={item.text} author={item.author} />
          ))}
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

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} locale={locale} more={t.common.more} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ----------------------------------------------------------------- FAQ */}
      <section className="shell section-t">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <Kicker>{home.faq.kicker}</Kicker>
            <h2 className="text-h2 text-ink mt-4">{home.faq.title}</h2>

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
