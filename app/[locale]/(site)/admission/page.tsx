import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Clock, MessageCircle, Phone } from "lucide-react";

import { ApplyForm } from "@/components/site/apply-form";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Kicker, SectionHeader } from "@/components/site/section-header";
import { SOCIAL_LABELS } from "@/components/site/social-icons";
import { buttonVariants } from "@/components/ui/button";
import { formatPhone, getSiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admission">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: "admission",
    title: t.admission.title,
    description: t.admission.lead,
  });
}

export default async function AdmissionPage({ params }: PageProps<"/[locale]/admission">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, contacts] = await Promise.all([getDictionary(locale), getSiteContacts()]);
  const a = t.admission;
  const invite = t.home.invite;

  const steps = [
    { title: a.step1Title, text: a.step1Text },
    { title: a.step2Title, text: a.step2Text },
    { title: a.step3Title, text: a.step3Text },
    { title: a.step4Title, text: a.step4Text },
  ];

  const documents = [a.doc1, a.doc2, a.doc3, a.doc4, a.doc5];
  const tryPoints = [a.tryPoint1, a.tryPoint2, a.tryPoint3];

  // Если школа ещё не заполнила ни телефон, ни WhatsApp — колонка «позвоните
  // напрямую» превратилась бы в пустую плашку с заголовком и без единой ссылки.
  // Тогда форма занимает панель целиком.
  const hasDirectContact = Boolean(contacts.phonePrimary || contacts.social.whatsapp);

  return (
    <>
      <PageHero
        locale={locale}
        t={t}
        kicker={a.kicker}
        title={a.title}
        lead={a.lead}
        aside={
          contacts.phonePrimary ? (
            <div className="card shadow-raised p-6">
              <span className="icon-tile">
                <Phone className="size-5" aria-hidden="true" />
              </span>
              <p className="text-kicker text-ink-faint mt-5 uppercase">{t.footer.phone}</p>
              <a
                href={`tel:${contacts.phonePrimary}`}
                className="font-display text-h3 text-ink hover:text-accent mt-1.5 block transition-colors duration-[180ms]"
                data-numeric
              >
                {formatPhone(contacts.phonePrimary)}
              </a>
              <p className="rule-t text-small text-ink-muted mt-5 pt-5">{invite.note}</p>
            </div>
          ) : contacts.social.whatsapp ? (
            // Пока отдельного номера приёмной нет — WhatsApp реально работает и его видно.
            <div className="card shadow-raised p-6">
              <span className="icon-tile">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <p className="text-kicker text-ink-faint mt-5 uppercase">{SOCIAL_LABELS.whatsapp}</p>
              <a
                href={contacts.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-h3 text-ink hover:text-accent mt-1.5 block transition-colors duration-[180ms]"
              >
                {invite.whatsapp}
              </a>
              <p className="rule-t text-small text-ink-muted mt-5 pt-5">{invite.note}</p>
            </div>
          ) : null
        }
      />

      {/* ------------------------------------------------------------- Шаги */}
      <section className="shell section-t">
        <SectionHeader
          kicker={a.stepsKicker}
          title={a.stepsTitle}
          lead={a.stepsLead}
          align="center"
        />

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            return (
              <li key={step.title} className="reveal relative">
                {/*
                 * Линия между шагами: маршрут читается как один путь, а не как
                 * четыре независимые карточки. Ширина считается от колонки, а
                 * не задана числом, — линия остаётся точной на любом экране и
                 * доходит ровно до соседнего кружка. Рисуется только там, где
                 * соседний шаг стоит в той же строке: на двух колонках это
                 * чётные индексы, на четырёх — все, кроме последнего.
                 */}
                {isLast ? null : (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "from-rule-strong to-rule absolute top-6 left-14 h-px w-[calc(100%-2rem)] bg-linear-to-r",
                      index % 2 === 0 ? "hidden sm:block" : "hidden lg:block",
                    )}
                  />
                )}

                <span
                  aria-hidden="true"
                  className="border-accent/15 bg-accent-soft font-display text-h3 text-accent relative grid size-12 place-items-center rounded-full border tabular-nums"
                >
                  {index + 1}
                </span>

                <h3 className="text-h3 text-ink mt-6">{step.title}</h3>
                <p className="text-small text-ink-muted mt-2.5">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* --------------------------------------------------------- Документы */}
      <section className="shell section-t">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <Kicker>{a.documentsKicker}</Kicker>
            <h2 className="text-h2 text-ink mt-4">{a.documentsTitle}</h2>
            <p className="text-body text-ink-muted mt-5 max-w-prose">{a.documentsNote}</p>
          </div>

          <ul className="grid gap-3 lg:col-span-7 lg:col-start-6">
            {documents.map((doc) => (
              <li key={doc} className="card reveal-sm flex items-center gap-4 p-4 md:p-5">
                <span className="bg-brand-soft text-brand grid size-10 shrink-0 place-items-center rounded-full">
                  <Check className="size-5" aria-hidden="true" />
                </span>
                <span className="text-body text-ink">{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------- Пробные дни */}
      <section className="shell section-t">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="relative lg:col-span-5">
            {/*
             * Зелёное свечение за аркой — глубина без второй фотографии.
             *
             * Вылет привязан к полям `shell`: до 48rem они 1.25rem, поэтому
             * там свечение расходится на 1rem, дальше — на 1.5rem при полях
             * 2rem. Иначе на 320px оно вылезало бы за окно на четыре пикселя
             * и добавляло странице горизонтальную прокрутку: `overflow-x:
             * hidden` на body в этом проекте намеренно нет.
             */}
            <div
              aria-hidden="true"
              className="deco-glow absolute -inset-4 -z-10 opacity-40 md:-inset-6"
            />

            <figure className="arch reveal-zoom bg-paper-sunken shadow-raised relative aspect-4/5 w-full">
              <Photo
                src={STOCK_IMAGES.lifeKids}
                alt={a.tryImageAlt}
                sizes="(min-width: 1024px) 38vw, 90vw"
              />
            </figure>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Kicker>{a.tryKicker}</Kicker>
            <h2 className="text-h2 text-ink mt-4">{a.tryTitle}</h2>
            <p className="text-lead text-ink-muted mt-6">{a.tryText}</p>

            <ul className="divide-rule border-rule mt-8 divide-y border-y">
              {tryPoints.map((point) => (
                <li key={point} className="flex items-start gap-3.5 py-4">
                  <Check className="text-brand mt-1 size-5 shrink-0" aria-hidden="true" />
                  <span className="text-body text-ink">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- Форма */}
      {/* Отдельного scroll-margin здесь нет: отступ под липкую шапку задан
          глобально через scroll-padding-top на html, и второй сдвиг только
          отбросил бы заголовок на середину экрана. */}
      <section id="apply" className="shell section-t">
        <SectionHeader kicker={a.formKicker} title={a.formTitle} lead={a.formLead} align="center" />

        {/*
         * Форма живёт в панели, а не на голом листе: заявка — целевое действие
         * страницы, и она должна выглядеть предметом, к которому подвели, а не
         * набором полей внизу текста.
         */}
        <div
          className={cn(
            "card shadow-raised mt-12 overflow-hidden",
            hasDirectContact && "lg:grid lg:grid-cols-12",
          )}
        >
          <div className={cn("p-6 sm:p-8 md:p-10", hasDirectContact && "lg:col-span-7")}>
            <ApplyForm locale={locale} t={t} />
          </div>

          {hasDirectContact ? (
            <aside className="border-rule bg-paper-sunken flex flex-col justify-center border-t p-6 sm:p-8 md:p-10 lg:col-span-5 lg:border-t-0 lg:border-l">
              <h3 className="text-h3 text-ink">{a.formDirectTitle}</h3>
              <p className="text-small text-ink-muted mt-3">{a.formDirectText}</p>

              <div className="mt-6 flex flex-col gap-3">
                {contacts.phonePrimary ? (
                  <a
                    href={`tel:${contacts.phonePrimary}`}
                    className={buttonVariants({ variant: "secondary", block: true })}
                    data-numeric
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {formatPhone(contacts.phonePrimary)}
                  </a>
                ) : null}

                {contacts.social.whatsapp ? (
                  <a
                    href={contacts.social.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "secondary", block: true })}
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    {invite.whatsapp}
                  </a>
                ) : null}
              </div>

              <p className="rule-t text-small text-ink-faint mt-6 flex items-start gap-2 pt-5">
                <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {invite.note}
              </p>
            </aside>
          ) : null}
        </div>
      </section>

      {/* --------------------------------------------------------- Приглашение */}
      <CtaBand locale={locale} t={t} contacts={contacts} />
    </>
  );
}
