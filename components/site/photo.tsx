import Image from "next/image";

import type { ImageSource } from "@/lib/content/stock-images";
import { cn } from "@/lib/utils";

/**
 * Фотография, заполняющая свою рамку.
 *
 * Одно место, где решается разница между локальным файлом и снимком из
 * Storage: у импортированного файла next/image уже знает размеры и умеет
 * показать размытую заглушку, у ссылки — нет. Без этой развилки половина
 * вызовов забывала бы `placeholder`, и фотографии школы вспыхивали бы
 * белым прямоугольником на медленной мобильной сети.
 *
 * Рамку (соотношение, скругление, фон) задаёт родитель — компонент
 * намеренно не решает за вёрстку, какой формы должна быть картинка.
 */
export function Photo({
  src,
  alt,
  sizes,
  className,
  priority = false,
  /** Плавный наезд, когда родитель с классом `group` под курсором. */
  zoom = false,
}: {
  src: ImageSource;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  zoom?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      // Обложка грузится первой и не должна ждать своей очереди в лениво
      // подгружаемой ленте — остальное подтягивается при подходе к экрану.
      fetchPriority={priority ? "high" : undefined}
      placeholder={typeof src === "object" ? "blur" : undefined}
      className={cn("object-cover", zoom && "media-zoom", className)}
    />
  );
}
