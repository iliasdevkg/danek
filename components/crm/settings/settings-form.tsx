"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { saveSiteSettings } from "@/lib/actions/settings";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { Json } from "@/lib/supabase/database.types";

type I18nValue = { ky: string; ru: string; en: string };

function asString(value: Json | undefined): string {
  return typeof value === "string" ? value : "";
}

function asI18n(value: Json | undefined): I18nValue {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    return {
      ky: typeof record.ky === "string" ? record.ky : "",
      ru: typeof record.ru === "string" ? record.ru : "",
      en: typeof record.en === "string" ? record.en : "",
    };
  }
  return { ky: "", ru: "", en: "" };
}

/** Однострочное текстовое поле настройки — телефон, почта, ссылка. */
function TextSetting({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldControl>
        {(props) => (
          <Input {...props} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </FieldControl>
    </Field>
  );
}

/** Поле на трёх языках сразу — подписано ярлыком языка внутри рамки поля. */
function I18nSetting({
  label,
  value,
  onChange,
}: {
  label: string;
  value: I18nValue;
  onChange: (value: I18nValue) => void;
}) {
  return (
    <div>
      <p className="text-small text-ink font-medium">{label}</p>
      <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
        {LOCALES.map((locale) => (
          <div key={locale} className="relative">
            <Input
              value={value[locale]}
              onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
              aria-label={LOCALE_LABELS[locale]}
              title={LOCALE_LABELS[locale]}
              className="pr-10"
            />
            <span className="text-caption text-ink-faint pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
              {locale.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsForm({
  locale,
  t,
  initial,
}: {
  locale: Locale;
  t: Dictionary;
  initial: Record<string, Json>;
}) {
  const [phone, setPhone] = useState(asString(initial["contacts.phone_primary"]));
  const [email, setEmail] = useState(asString(initial["contacts.email"]));
  const [address, setAddress] = useState(asI18n(initial["contacts.address"]));
  const [workHours, setWorkHours] = useState(asI18n(initial["contacts.work_hours"]));
  const [instagram, setInstagram] = useState(asString(initial["social.instagram"]));
  const [facebook, setFacebook] = useState(asString(initial["social.facebook"]));
  const [whatsapp, setWhatsapp] = useState(asString(initial["social.whatsapp"]));
  const [telegram, setTelegram] = useState(asString(initial["social.telegram"]));
  const [bankName, setBankName] = useState(asString(initial["payment.bank_name"]));
  const [account, setAccount] = useState(asString(initial["payment.account"]));
  const [recipient, setRecipient] = useState(asString(initial["payment.recipient"]));

  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const s = t.crm.settings;

  function submit() {
    startTransition(async () => {
      const result = await saveSiteSettings(locale, [
        { key: "contacts.phone_primary", value: phone },
        { key: "contacts.email", value: email },
        { key: "contacts.address", value: address },
        { key: "contacts.work_hours", value: workHours },
        { key: "social.instagram", value: instagram },
        { key: "social.facebook", value: facebook },
        { key: "social.whatsapp", value: whatsapp },
        { key: "social.telegram", value: telegram },
        { key: "payment.bank_name", value: bankName },
        { key: "payment.account", value: account },
        { key: "payment.recipient", value: recipient },
      ]);

      if (result.ok) toast({ title: s.saved, tone: "success" });
      else toast({ title: t.common.error, description: result.error, tone: "danger" });
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-h3 text-ink">{s.contactsGroup}</h2>
        <TextSetting label={t.footer.phone} value={phone} onChange={setPhone} type="tel" />
        <TextSetting label={t.footer.email} value={email} onChange={setEmail} type="email" />
        <I18nSetting label={t.contactsPage.addressTitle} value={address} onChange={setAddress} />
        <I18nSetting label={t.contactsPage.hoursTitle} value={workHours} onChange={setWorkHours} />
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-h3 text-ink">{s.socialGroup}</h2>
        <TextSetting label="Instagram" value={instagram} onChange={setInstagram} />
        <TextSetting label="Facebook" value={facebook} onChange={setFacebook} />
        <TextSetting label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
        <TextSetting label="Telegram" value={telegram} onChange={setTelegram} />
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-h3 text-ink">{s.paymentGroup}</h2>
        <TextSetting label={s.bankNameLabel} value={bankName} onChange={setBankName} />
        <TextSetting label={s.accountLabel} value={account} onChange={setAccount} />
        <TextSetting label={s.recipientLabel} value={recipient} onChange={setRecipient} />
      </section>

      <div>
        <Button loading={isPending} onClick={submit}>
          {s.save}
        </Button>
      </div>
    </div>
  );
}
