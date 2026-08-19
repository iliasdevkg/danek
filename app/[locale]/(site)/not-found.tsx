import { NotFoundContent, type NotFoundStrings } from "@/components/site/not-found-content";
import { en } from "@/lib/i18n/dictionaries/en";
import { ky } from "@/lib/i18n/dictionaries/ky";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { ru } from "@/lib/i18n/dictionaries/ru";

/**
 * Страница 404.
 *
 * Next не передаёт params в not-found, поэтому язык определяется по адресу уже
 * в браузере. Три коротких набора строк весят меньше килобайта — дешевле, чем
 * показывать русский текст англоязычному посетителю.
 *
 * Наружу уходят только эти восемь строк: сами словари остаются на сервере,
 * потому что этот файл — серверный компонент, а в браузер уезжают лишь пропсы.
 */
function strings(d: Dictionary): NotFoundStrings {
  return {
    title: d.errorPage.notFoundTitle,
    text: d.errorPage.notFoundText,
    action: d.errorPage.notFoundAction,
    linksTitle: d.errorPage.notFoundLinks,
    imageAlt: d.errorPage.notFoundImageAlt,
    admission: d.nav.admission,
    programs: d.nav.programs,
    contacts: d.nav.contacts,
  };
}

export default function NotFound() {
  return <NotFoundContent strings={{ ky: strings(ky), ru: strings(ru), en: strings(en) }} />;
}
