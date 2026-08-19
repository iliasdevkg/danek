import { demoNews, demoNewsArticle, demoNewsSlugs, isDemoContent } from "@/lib/content/demo";
import { pickI18n } from "@/lib/content/i18n-value";
import type { ImageSource } from "@/lib/content/stock-images";
import { mediaUrl } from "@/lib/content/storage";
import type { Locale } from "@/lib/i18n/config";
import { getPublicSupabase } from "@/lib/supabase/public";
import type { I18nText } from "@/lib/supabase/database.types";

export type NewsCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Строка — обложка из Storage, объект — локальный демонстрационный кадр. */
  coverUrl: ImageSource | null;
  publishedAt: string;
};

export type NewsArticle = NewsCard & { body: string };

type NewsRow = {
  id: string;
  slug: string;
  title: I18nText;
  excerpt: I18nText;
  body?: I18nText;
  cover_path: string | null;
  published_at: string | null;
};

function toCard(row: NewsRow, locale: Locale): NewsCard {
  return {
    id: row.id,
    slug: row.slug,
    title: pickI18n(row.title, locale),
    excerpt: pickI18n(row.excerpt, locale),
    coverUrl: mediaUrl(row.cover_path),
    // RLS не отдаёт неопубликованное, поэтому published_at здесь всегда заполнен.
    publishedAt: row.published_at ?? new Date().toISOString(),
  };
}

export async function getPublishedNews(locale: Locale, limit?: number): Promise<NewsCard[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return isDemoContent ? demoNews(locale, limit) : [];

  let query = supabase
    .from("news")
    .select("id, slug, title, excerpt, cover_path, published_at")
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error || !data) {
    console.error("[news] не удалось прочитать новости:", error?.message);
    return [];
  }

  return data.map((row) => toCard(row as NewsRow, locale));
}

export async function getNewsArticle(slug: string, locale: Locale): Promise<NewsArticle | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return isDemoContent ? demoNewsArticle(slug, locale) : null;

  const { data, error } = await supabase
    .from("news")
    .select("id, slug, title, excerpt, body, cover_path, published_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("[news] не удалось прочитать новость:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as NewsRow;
  return { ...toCard(row, locale), body: pickI18n(row.body, locale) };
}

/** Слаги для пререндера страниц новостей на сборке. */
export async function getNewsSlugs(): Promise<string[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return isDemoContent ? demoNewsSlugs() : [];

  const { data, error } = await supabase
    .from("news")
    .select("slug")
    .eq("is_published", true)
    .lte("published_at", new Date().toISOString());

  if (error || !data) return [];
  return data.map((row) => row.slug);
}
