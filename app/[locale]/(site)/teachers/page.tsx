import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRoundCheck, Users } from "lucide-react";

import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Kicker } from "@/components/site/section-header";
import { TeacherCard } from "@/components/site/teacher-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getSiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { getPublicTeachers } from "@/lib/content/teachers";
import { isLocale, LOCALE_HTML_LANG } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/teachers">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: "teachers",
    title: t.teachersPage.title,
    description: t.teachersPage.lead,
  });
}

export default async function TeachersPage({ params }: PageProps<"/[locale]/teachers">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, contacts, teachers] = await Promise.all([
    getDictionary(locale),
    getSiteContacts(),
    getPublicTeachers(locale),
  ]);

  const page = t.teachersPage;

  /*
   * Стаж набирается в трёх формах: «1 год», «2 года», «5 лет».
   * Форму выбирает Intl.PluralRules по правилам самого языка — иначе
   * первый же педагог с годом стажа получил бы подпись «1 лет».
   */
  const plural = new Intl.PluralRules(LOCALE_HTML_LANG[locale]);
  const experienceLabel = (years: number) => {
    const form = plural.select(years);
    const template =
      form === "one"
        ? page.experienceOne
        : form === "few"
          ? page.experienceFew
          : page.experienceMany;
    return template.replace("{n}", String(years));
  };

  return (
    <>
      <PageHero
        locale={locale}
        t={t}
        kicker={page.kicker}
        title={page.title}
        lead={page.lead}
        image={STOCK_IMAGES.teachersBanner}
        imageAlt={page.bannerAlt}
      />

      {/* ------------------------------------------------------------- Баннер */}
      <section className="shell pt-10 md:pt-14">
        <figure className="bg-paper-sunken shadow-raised relative aspect-4/3 w-full overflow-hidden rounded-2xl sm:aspect-video lg:aspect-21/9">
          {/* Кадр намеренно другой, чем в шапке: тот показывает класс целиком,
              этот — работу один на один, ради которой раздел и существует.
              Повтор одной фотографии дважды подряд читается как недосмотр. */}
          <Photo
            src={STOCK_IMAGES.lifeReading}
            alt={page.bannerAlt}
            priority
            sizes="(min-width: 1280px) 1216px, 92vw"
          />

          {/* Затемнение снизу: строка обязана читаться поверх светлого класса.
              Цвет берём из токена `band` — он для того и заведён отдельно от
              `paper-inverse`, чтобы затемнение оставалось тёмным и в тёмной теме. */}
          <div
            aria-hidden="true"
            className="from-band via-band/45 absolute inset-0 bg-linear-to-t to-transparent"
          />

          <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-10">
            <p className="font-display text-h3 max-w-lg text-white">{page.bannerLine}</p>
          </figcaption>
        </figure>
      </section>

      {/* ------------------------------------------------------------ Педагоги */}
      <section className="shell section-t">
        {/* Заголовок раздела продублировал бы h1 «Кто учит», но без него имена
            педагогов (h3) висели бы сразу под h1 — скринридер потерял бы уровень. */}
        <h2 className="sr-only">{t.nav.teachers}</h2>

        {teachers.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 md:grid-cols-3 md:gap-x-8 md:gap-y-12 lg:grid-cols-4">
            {teachers.map((teacher) => (
              <li key={teacher.id} className="fx-in">
                <TeacherCard teacher={teacher} />

                {teacher.yearsTeaching ? (
                  <p className="text-caption text-ink-faint mt-2 text-center" data-numeric>
                    {experienceLabel(teacher.yearsTeaching)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          /* Педагогов может не быть: школа наполняет раздел через CRM. Пустой
             экран всё равно ведёт дальше — родителю предлагают прийти и
             познакомиться лично, как и обещает текст. */
          <EmptyState
            icon={<Users className="size-7" aria-hidden="true" />}
            title={page.emptyTitle}
            description={page.empty}
            action={
              <Link
                href={routes.contacts(locale)}
                className={buttonVariants({ variant: "secondary" })}
              >
                {t.nav.contacts}
              </Link>
            }
          />
        )}
      </section>

      {/* -------------------------------------------------------- Как выбираем */}
      <section className="shell section-t">
        <div className="card fx-in relative flex flex-col gap-6 overflow-hidden p-7 md:flex-row md:items-start md:gap-10 md:p-12">
          {/* Зелёное свечение из угла — тот же приём, что на обложке:
              глубина без второй фотографии и без единого лишнего запроса. */}
          <div
            aria-hidden="true"
            className="deco-glow absolute -top-20 -left-16 size-56 opacity-50"
          />

          <span className="icon-tile relative size-14">
            <UserRoundCheck className="size-6" aria-hidden="true" />
          </span>

          <div className="relative max-w-2xl">
            <Kicker>{page.selectionKicker}</Kicker>
            <h2 className="text-h2 text-ink mt-4">{t.home.principles.gradesTitle}</h2>
            <p className="text-lead text-ink-muted mt-4">{t.home.principles.gradesText}</p>
          </div>
        </div>
      </section>

      <CtaBand
        locale={locale}
        t={t}
        contacts={contacts}
        title={page.ctaTitle}
        text={page.ctaText}
      />
    </>
  );
}
