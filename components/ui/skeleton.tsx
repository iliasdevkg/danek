import { cn } from "@/lib/utils";

/**
 * Заглушка загрузки повторяет форму будущего содержимого, а не просто крутится.
 * Пользователь понимает, что грузится, и раскладка не прыгает при подстановке.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton h-4 w-full", className)} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          // Последняя строка абзаца всегда короче — так заглушка похожа на текст.
          className={i === lines - 1 ? "w-[62%]" : "w-full"}
        />
      ))}
    </div>
  );
}
