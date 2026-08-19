import { demoGallery, isDemoContent } from "@/lib/content/demo";
import { pickI18n } from "@/lib/content/i18n-value";
import type { ImageSource } from "@/lib/content/stock-images";
import { mediaUrl } from "@/lib/content/storage";
import type { Locale } from "@/lib/i18n/config";
import { getPublicSupabase } from "@/lib/supabase/public";
import type { I18nText } from "@/lib/supabase/database.types";

export type GalleryPhoto = {
  id: string;
  /** Строка — снимок из Storage, объект — локальный демонстрационный кадр. */
  url: ImageSource;
  alt: string;
  width: number | null;
  height: number | null;
  blurData: string | null;
};

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: ImageSource | null;
  happenedOn: string | null;
  photos: GalleryPhoto[];
};

type PhotoRow = {
  id: string;
  path: string;
  alt: I18nText;
  width: number | null;
  height: number | null;
  blur_data: string | null;
};

type AlbumRow = {
  id: string;
  slug: string;
  title: I18nText;
  description: I18nText;
  cover_path: string | null;
  happened_on: string | null;
  gallery_photos: PhotoRow[] | null;
};

export async function getGalleryAlbums(locale: Locale): Promise<GalleryAlbum[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return isDemoContent ? demoGallery(locale) : [];

  const { data, error } = await supabase
    .from("gallery_albums")
    .select(
      "id, slug, title, description, cover_path, happened_on, gallery_photos(id, path, alt, width, height, blur_data)",
    )
    .eq("is_published", true)
    .order("happened_on", { ascending: false, nullsFirst: false })
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("[gallery] не удалось прочитать альбомы:", error?.message);
    return [];
  }

  return (data as unknown as AlbumRow[]).map((album) => {
    const photos = (album.gallery_photos ?? []).flatMap((photo) => {
      const url = mediaUrl(photo.path);
      if (!url) return [];
      return [
        {
          id: photo.id,
          url,
          alt: pickI18n(photo.alt, locale),
          width: photo.width,
          height: photo.height,
          blurData: photo.blur_data,
        },
      ];
    });

    return {
      id: album.id,
      slug: album.slug,
      title: pickI18n(album.title, locale),
      description: pickI18n(album.description, locale),
      // Обложка не задана — берём первый снимок альбома, а не пустой блок.
      coverUrl: mediaUrl(album.cover_path) ?? photos[0]?.url ?? null,
      happenedOn: album.happened_on,
      photos,
    };
  });
}
