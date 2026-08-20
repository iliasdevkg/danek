import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, GraduationCap, Languages, Medal, UtensilsCrossed } from "lucide-react";
import type { ComponentType } from "react";

import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Kicker, SectionHeader } from "@/components/site/section-header";
import { TeacherCard } from "@/components/site/teacher-card";
import { buttonVariants } from "@/components/ui/button";
import { getSiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { getPublicTeachers } from "@/lib/content/teachers";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return pageMetadata({ locale, path: "about", title: t.about.title, description: t.about.lead });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, contacts, teachers] = await Promise.all([
    getDictionary(locale),
    getSiteContacts(),
    getPublicTeachers(locale, 4),
  ]);

  const a = t.about;

  const approach: { icon: ComponentType<{ className?: string }>; title: string; text: string }[] = [
    { icon: Languages, title: a.a1Title, text: a.a1Text },
    { icon: UtensilsCrossed, title: a.a2Title, text: a.a2Text },
    { icon: GraduationCap, title: a.a3Title, text: a.a3Text },
    { icon: Medal, title: a.a4Title, text: a.a4Text },
  ];

  return (
    <>
      <PageHero
        locale={locale}
        t={t}
        kicker={a.kicker}
        title={a.title}
        lead={a.lead}
        image={STOCK_IMAGES.aboutCampus}
        imageAlt={a.campusImageAlt}
      />

      {/* --------------------------------------------------------- Территория */}
      {/* ------------------------------------------------------------- Миссия */}
      <section className="shell section-t">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <Kicker>{a.missionKicker}</Kicker>
            <h2 className="text-h2 text-ink mt-4">{a.missionTitle}</h2>

            <p className="text-lead text-ink mt-6">{a.missionText1}</p>
            <p className="text-body text-ink-muted mt-4">{a.missionText2}</p>

            <Link
              href={routes.programs(locale)}
              className={buttonVariants({ variant: "secondary", className: "group mt-8" })}
            >
              {a.missionCta}
              <ArrowRight
                className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Коллаж зеркален главной: там кадр слева, здесь справа. Порядок в
              разметке — текст первым, поэтому на телефоне читатель получает
              сначала мысль, а потом иллюстрацию к ней. */}
          <div className="relative lg:col-span-5 lg:col-start-8">
            <div
              aria-hidden="true"
              className="deco-glow absolute -inset-6 -z-10 hidden opacity-40 lg:block"
            />

            <figure className="fx-mask bg-paper-sunken shadow-raised relative aspect-4/5 w-full overflow-hidden rounded-xs">
              <Photo
                src={STOCK_IMAGES.aboutMission}
                alt={a.missionImageAlt}
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </figure>

            <figure className="border-paper bg-paper-sunken shadow-float absolute -bottom-8 -left-3 hidden aspect-square w-40 overflow-hidden rounded-2xl border-4 sm:block md:w-48 lg:-left-8">
              <Photo src={STOCK_IMAGES.aboutLibrary} alt={a.missionSecondImageAlt} sizes="192px" />
            </figure>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- Подход */}
      <section className="shell section-t">
        <SectionHeader kicker={a.approachKicker} title={a.approachTitle} align="center" />

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {approach.map((item) => (
            <li
              key={item.title}
              className="card fx-in group hover:border-rule-strong flex gap-5 p-6 transition-colors duration-[240ms] md:p-7"
            >
              <span className="icon-tile group-hover:bg-accent transition-colors duration-[240ms] group-hover:text-white">
                <item.icon className="size-5" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <h3 className="text-h3 text-ink">{item.title}</h3>
                <p className="text-small text-ink-muted mt-2">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* -------------------------------------------------------- Жизнь школы */}
      <section className="shell section-t">
        {/* Кадр во всю ширину с подписью поверх: после четырёх карточек нужен
            воздух и живой снимок, а не ещё один блок текста на белом.
            data-surface нужен ради кольца фокуса — на тёмном оно золотое. */}
        <div
          className="group bg-paper-sunken shadow-card relative aspect-3/4 overflow-hidden rounded-2xl sm:aspect-video lg:aspect-21/9"
          data-surface="dark"
        >
          <Photo
            src={STOCK_IMAGES.parentsSeminar}
            alt={a.lifeImageAlt}
            zoom
            sizes="(min-width: 1280px) 1216px, 100vw"
          />

          {/* Затемнение снизу вверх: подпись обязана читаться на любом кадре,
              а верх фотографии остаётся чистым. */}
          <div
            aria-hidden="true"
            className="from-band via-band/45 absolute inset-0 bg-gradient-to-t to-transparent"
          />

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-12">
            <div className="max-w-xl">
              <Kicker tone="inverse">{a.lifeKicker}</Kicker>
              <h2 className="text-h2 mt-4 text-white">{a.lifeTitle}</h2>
              <p className="text-small md:text-body mt-3 text-white/75">{a.lifeText}</p>

              <Link
                href={routes.gallery(locale)}
                className={buttonVariants({ variant: "inverse", className: "group/cta mt-6" })}
              >
                {a.galleryCta}
                <ArrowRight
                  className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover/cta:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Педагоги */}
      {teachers.length > 0 ? (
        <section className="shell section-t">
          <SectionHeader
            kicker={t.home.teachers.kicker}
            title={t.home.teachers.title}
            lead={t.home.teachers.lead}
            action={
              <Link
                href={routes.teachers(locale)}
                className={buttonVariants({ variant: "secondary" })}
              >
                {t.home.teachers.cta}
              </Link>
            }
          />

          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="fx-in">
                <TeacherCard teacher={teacher} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------- Приглашение */}
      <CtaBand locale={locale} t={t} contacts={contacts} />
    </>
  );
}
