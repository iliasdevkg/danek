import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";

import { Kicker } from "@/components/site/section-header";
import { buttonVariants } from "@/components/ui/button";
import { formatPhone, type SiteContacts } from "@/lib/content/site-settings";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";

/**
 * Приглашение прийти в школу — последний экран перед подвалом.
 *
 * Три способа связаться стоят рядом, потому что родители делятся ровно на
 * три группы: одни заполнят форму, вторые позвонят, третьи напишут
 * в WhatsApp и не станут звонить никогда. Убрать любой из трёх — потерять
 * треть обращений.
 */
export function CtaBand({
  locale,
  t,
  contacts,
}: {
  locale: Locale;
  t: Dictionary;
  contacts: SiteContacts;
}) {
  const invite = t.home.invite;

  return (
    <section className="shell section-t">
      <div
        className="surface-dark relative overflow-hidden rounded-2xl px-6 py-14 text-white md:px-14 md:py-20"
        data-surface="dark"
      >
        <div aria-hidden="true" className="deco-dots absolute inset-0 text-white" />

        <div className="relative max-w-2xl">
          <Kicker tone="inverse">{invite.kicker}</Kicker>

          <h2 className="text-h2 mt-4 text-white">{invite.title}</h2>
          <p className="text-lead mt-4 text-white/70">{invite.text}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={routes.admission(locale)}
              className={buttonVariants({ variant: "gold", size: "lg", className: "group" })}
            >
              {invite.action}
              <ArrowRight
                className="size-4 transition-transform duration-[240ms] ease-(--ease-entrance) group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            {contacts.phonePrimary ? (
              <a
                href={`tel:${contacts.phonePrimary}`}
                className={buttonVariants({ variant: "inverse", size: "lg" })}
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
                className={buttonVariants({ variant: "inverse", size: "lg" })}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                {invite.whatsapp}
              </a>
            ) : null}
          </div>

          <p className="text-small mt-5 text-white/50">{invite.note}</p>
        </div>
      </div>
    </section>
  );
}
