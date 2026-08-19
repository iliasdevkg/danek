import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Images } from "lucide-react";

import { CtaBand } from "@/components/site/cta-band";
import { GalleryAlbums } from "@/components/site/gallery-albums";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { EmptyState } from "@/components/ui/empty-state";
import { getGalleryAlbums } from "@/lib/content/gallery";
import { getSiteContacts } from "@/lib/content/site-settings";
import { STOCK_IMAGES } from "@/lib/content/stock-images";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/gallery">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: "gallery",
    title: t.galleryPage.title,
    description: t.galleryPage.lead,
  });
}

export default async function GalleryPage({ params }: PageProps<"/[locale]/gallery">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, contacts, allAlbums] = await Promise.all([
    getDictionary(locale),
    getSiteContacts(),
    getGalleryAlbums(locale),
  ]);

  // Альбом без единого снимка — это заголовок над пустотой. Такие не
  // показываем вовсе: страница должна выглядеть либо полной, либо честно
  // пустой, но не сломанной.
  const albums = allAlbums.filter((album) => album.photos.length > 0);

  return (
    <>
      <PageHero
        locale={locale}
        t={t}
        kicker={t.galleryPage.kicker}
        title={t.galleryPage.title}
        lead={t.galleryPage.lead}
        aside={
          // Единственная арка на странице — знак школы держит один кадр в шапке.
          // Дальше идут прямоугольные плитки альбомов: если купол повторить
          // шестнадцать раз, он перестанет читаться как знак.
          <figure className="arch bg-paper-sunken shadow-raised relative mx-auto aspect-4/5 w-full max-w-64 lg:mr-0 lg:ml-auto lg:max-w-72">
            <Photo
              src={STOCK_IMAGES.lifeCelebration}
              alt={t.galleryPage.heroImageAlt}
              priority
              sizes="(min-width: 1024px) 288px, 256px"
            />
          </figure>
        }
      />

      <section className="shell section-t">
        {albums.length > 0 ? (
          <GalleryAlbums
            albums={albums}
            locale={locale}
            labels={{
              photosCount: t.galleryPage.photosCount,
              photosCountOne: t.galleryPage.photosCountOne,
              close: t.common.close,
              previous: t.common.back,
              next: t.common.next,
            }}
          />
        ) : (
          <EmptyState
            icon={<Images className="size-7" aria-hidden="true" />}
            title={t.common.empty}
            description={t.galleryPage.empty}
          />
        )}
      </section>

      <CtaBand locale={locale} t={t} contacts={contacts} />
    </>
  );
}
