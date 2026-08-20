import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpenCheck,
  CalendarCheck,
  Clock,
  GraduationCap,
  MessageCircle,
  Phone,
  QrCode,
  ReceiptText,
  Trophy,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { ComponentType } from "react";

import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Kicker, SectionHeader } from "@/components/site/section-header";
import { buttonVariants } from "@/components/ui/button";
import { getPublicTuition } from "@/lib/content/academics";
import { formatPhone, getSiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { formatMoney } from "@/lib/format";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/tuition">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: "tuition",
    title: t.tuitionPage.title,
    description: t.tuitionPage.lead,
  });
}

export default async function TuitionPage({ params }: PageProps<"/[locale]/tuition">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, plans, contacts] = await Promise.all([
    getDictionary(locale),
    getPublicTuition(locale),
    getSiteContacts(),
  ]);

  const page = t.tuitionPage;
  const invite = t.home.invite;

  const periodLabel = {
    monthly: page.periodMonthly,
    quarterly: page.periodQuarterly,
    yearly: page.periodYearly,
  } as const;

  const gradeLabel = (from: number, to: number) =>
    from === to
      ? page.gradeSingle.replace("{n}", String(from))
      : page.gradeRange.replace("{from}", String(from)).replace("{to}", String(to));

  const included: { icon: ComponentType<{ className?: string }>; title: string; text: string }[] = [
    { icon: BookOpenCheck, title: page.included1Title, text: page.included1Text },
    { icon: UtensilsCrossed, title: page.included2Title, text: page.included2Text },
    { icon: Trophy, title: page.included3Title, text: page.included3Text },
    { icon: GraduationCap, title: page.included4Title, text: page.included4Text },
  ];

  const discounts: { icon: ComponentType<{ className?: string }>; title: string; text: string }[] =
    [
      { icon: CalendarCheck, title: page.discount1Title, text: page.discount1Text },
      { icon: Users, title: page.discount2Title, text: page.discount2Text },
    ];

  const payment: { icon: ComponentType<{ className?: string }>; text: string }[] = [
    { icon: QrCode, text: page.note1 },
    { icon: ReceiptText, text: page.note2 },
  ];

  // Ни телефона, ни WhatsApp в настройках — панель осталась бы с заголовком
  // и без единого способа связаться. Тогда единственным действием становится
  // заявка: её школа получит в любом случае.
  const hasDirectContact = Boolean(contacts.phonePrimary || contacts.social.whatsapp);

  /*
   * Главное действие страницы.
   *
   * Цифр на сайте нет и не будет — школа пересматривает их каждый учебный год,
   * а устаревший прайс хуже отсутствующего. Поэтому панель стоит там, где
   * родитель ищет число: либо сразу под шапкой, если прайс не опубликован,
   * либо следом за ним. Крупно набран телефон — единственная цифра, которую
   * страница может назвать честно.
   */
  const askPanel = (
    <section className="shell section-t">
      <div className="card shadow-float overflow-hidden">
        <div className="grid lg:grid-cols-12">
          <div className="p-6 sm:p-10 lg:col-span-7 lg:p-14">
            <Kicker>{page.askKicker}</Kicker>
            <h2 className="text-h2 text-ink mt-4">{page.askTitle}</h2>
            <p className="text-lead text-ink-muted mt-5 max-w-prose">{page.askText}</p>
          </div>

          <div className="border-rule bg-paper-sunken flex flex-col justify-center border-t p-6 sm:p-10 lg:col-span-5 lg:border-t-0 lg:border-l lg:p-14">
            {contacts.phonePrimary ? (
              <>
                <p className="text-kicker text-ink-faint uppercase">{t.footer.phone}</p>
                <a
                  href={`tel:${contacts.phonePrimary}`}
                  className="font-display text-h3 text-ink hover:text-accent sm:text-h2 mt-2 block transition-colors duration-[180ms]"
                  data-numeric
                >
                  {formatPhone(contacts.phonePrimary)}
                </a>
              </>
            ) : null}

            <div className={cn("flex flex-col gap-3", contacts.phonePrimary && "mt-7")}>
              {contacts.phonePrimary ? (
                <a
                  href={`tel:${contacts.phonePrimary}`}
                  className={buttonVariants({ size: "lg", block: true })}
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {page.askCall}
                </a>
              ) : null}

              {contacts.social.whatsapp ? (
                <a
                  href={contacts.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  // Без телефона WhatsApp остаётся единственным способом связаться
                  // и обязан выглядеть основным действием, а не запасным.
                  className={buttonVariants({
                    variant: contacts.phonePrimary ? "secondary" : "primary",
                    size: "lg",
                    block: true,
                  })}
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {page.askWhatsapp}
                </a>
              ) : null}

              {hasDirectContact ? null : (
                <Link
                  href={routes.admission(locale)}
                  className={buttonVariants({ variant: "gold", size: "lg", block: true })}
                >
                  {t.nav.apply}
                </Link>
              )}
            </div>

            <p className="rule-t text-small text-ink-faint mt-7 flex items-start gap-2 pt-5">
              <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {invite.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <PageHero
        locale={locale}
        t={t}
        kicker={page.kicker}
        title={page.title}
        lead={page.lead}
        image={STOCK_IMAGES.lifeStudy}
        imageAlt={page.includedImageAlt}
      />

      {/* --------------------------------------------------------------- Прайс */}
      {plans.length > 0 ? (
        <section aria-labelledby="tuition-plans" className="shell section-t">
          {/* Раздел без видимого заголовка: h1 уже сказал «сколько стоит».
              Скринридеру всё равно нужно имя области и целый уровень между h1
              и названиями тарифов — рубрика подходит лучше подписи колонки. */}
          <h2 id="tuition-plans" className="sr-only">
            {page.kicker}
          </h2>

          {/*
           * Прайс — не таблица, а список строк: таблица из трёх колонок на
           * телефоне либо уезжает вбок, либо сжимается до нечитаемого. Подписи
           * колонок появляются только там, где строка действительно делится
           * надвое, — на узком экране они бы висели над пустотой.
           */}
          <div className="text-kicker text-ink-faint hidden justify-between px-6 pb-3 uppercase sm:flex md:px-8">
            <span>{page.gradeColumn}</span>
            <span>{page.priceColumn}</span>
          </div>

          <ul className="card divide-rule divide-y overflow-hidden">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className="fx-in flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 md:px-8"
              >
                {/* min-w-0: название тарифа приходит из CRM, и длинное имя
                    рядом с несжимаемой суммой обязано переноситься, а не
                    выталкивать её за край карточки. */}
                <div className="min-w-0">
                  <span className="chip">{gradeLabel(plan.gradeFrom, plan.gradeTo)}</span>
                  <h3 className="text-h3 text-ink mt-3">{plan.name}</h3>
                  {plan.note ? (
                    <p className="text-small text-ink-muted mt-1.5 max-w-prose">{plan.note}</p>
                  ) : null}
                </div>

                <p className="font-display text-h2 text-ink shrink-0 sm:text-right" data-numeric>
                  {formatMoney(plan.amount, locale)}
                  <span className="text-small text-ink-muted ml-2 font-sans font-normal">
                    {periodLabel[plan.period]}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        askPanel
      )}

      {/* ------------------------------------------------- Что входит в оплату */}
      <section className="shell section-t">
        <SectionHeader
          kicker={page.includedKicker}
          title={page.includedTitle}
          lead={page.includedLead}
        />

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative lg:col-span-5">
            {/*
             * Зелёное свечение за кадром — глубина без второй фотографии.
             *
             * Вылет привязан к отступу `shell`: на телефоне он 20px, поэтому
             * -inset-6 (24px) вытолкнул бы свечение за правый край экрана и
             * дал горизонтальную прокрутку — тело страницы намеренно ничего
             * не подрезает. С md отступ становится 32px, и запас появляется.
             */}
            <div
              aria-hidden="true"
              className="deco-glow absolute -inset-4 -z-10 opacity-40 md:-inset-6"
            />

            <figure className="fx-mask bg-paper-sunken shadow-raised relative aspect-4/5 w-full overflow-hidden rounded-xs">
              <Photo
                src={STOCK_IMAGES.lifeClassroom}
                alt={page.includedImageAlt}
                sizes="(min-width: 1024px) 38vw, 90vw"
              />
            </figure>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
            {included.map((item) => (
              <li key={item.title} className="card fx-in p-6">
                <span className="icon-tile">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-h3 text-ink mt-5">{item.title}</h3>
                <p className="text-small text-ink-muted mt-2.5">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------------- Скидки */}
      <section className="shell section-t">
        <SectionHeader kicker={page.discountsKicker} title={page.discountsTitle} align="center" />

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {discounts.map((item) => (
            <li key={item.title} className="card fx-in flex items-start gap-4 p-6 sm:gap-5 sm:p-7">
              <span className="icon-tile">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-h3 text-ink">{item.title}</h3>
                <p className="text-small text-ink-muted mt-2.5">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-small text-ink-muted mx-auto mt-8 max-w-2xl text-center">
          {page.discountsNote}
        </p>
      </section>

      {/* --------------------------------------------------- Назовём по звонку */}
      {plans.length > 0 ? askPanel : null}

      {/* ------------------------------------------------------- Как платить */}
      <section className="shell section-t">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <h2 className="text-h2 text-ink">{page.noteTitle}</h2>
          </div>

          <ul className="grid gap-3 lg:col-span-7 lg:col-start-6">
            {payment.map((item) => (
              <li key={item.text} className="card fx-in flex items-center gap-4 p-4 md:p-5">
                <span className="bg-accent-soft text-accent grid size-10 shrink-0 place-items-center rounded-full">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-body text-ink">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------------------------------------- Приглашение */}
      <CtaBand locale={locale} t={t} contacts={contacts} />
    </>
  );
}
