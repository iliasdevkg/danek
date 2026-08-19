import type { ComponentType } from "react";

import type { SiteContacts } from "@/lib/content/site-settings";

/**
 * Значки соцсетей.
 *
 * В lucide фирменные логотипы больше не поставляются — их убрали из набора
 * из-за прав на товарные знаки. Рисуем сами: это четыре пути, они уходят
 * в HTML вместе со страницей и не стоят ни одного запроса, тогда как любая
 * иконочная библиотека ради тех же четырёх знаков притащила бы десятки
 * килобайт.
 *
 * `currentColor` вместо фирменных цветов — значок подчиняется теме и одинаково
 * читается на белом фоне и на синей плашке подвала.
 */
type IconProps = { className?: string };

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Пузырь с «хвостом» влево-вниз — узнаваемый силуэт мессенджера. */}
      <path
        d="M12 3.2a8.6 8.6 0 0 0-7.4 13l-1.2 4.3 4.4-1.15A8.6 8.6 0 1 0 12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.1 8.3c.25-.05.5 0 .64.28l.72 1.45c.12.24.07.53-.12.72l-.4.4a5.7 5.7 0 0 0 2.85 2.85l.4-.4c.19-.19.48-.24.72-.12l1.45.72c.28.14.33.39.28.64-.16.83-.93 1.44-1.78 1.4-3.1-.16-5.75-2.81-5.91-5.91-.04-.85.57-1.62 1.4-1.78Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TelegramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 4.6 2.9 11.3c-.7.26-.68 1.26.03 1.49l4.4 1.4 1.7 5.1c.2.6.97.76 1.39.29l2.4-2.66 4.4 3.24c.5.37 1.22.1 1.36-.51L22.4 5.6c.15-.66-.5-1.22-1.4-1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m7.4 14.2 11-7.6-7.6 9.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M14.9 8.6h-1.2c-.6 0-1 .4-1 1v1.5h2.1l-.3 2.2h-1.8V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.6 11.1h2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type SocialKey = keyof SiteContacts["social"];

export const SOCIAL_ICONS: Record<SocialKey, ComponentType<IconProps>> = {
  instagram: InstagramIcon,
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
  facebook: FacebookIcon,
};

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  facebook: "Facebook",
};

/** Порядок вывода: сначала каналы, где школа действительно отвечает. */
export const SOCIAL_ORDER: SocialKey[] = ["instagram", "whatsapp", "telegram", "facebook"];

/** Заполненные соцсети школы в порядке SOCIAL_ORDER. */
export function socialLinks(contacts: SiteContacts) {
  return SOCIAL_ORDER.flatMap((key) => {
    const href = contacts.social[key];
    return href ? [{ key, href, label: SOCIAL_LABELS[key], Icon: SOCIAL_ICONS[key] }] : [];
  });
}
