import { cn } from "@/lib/utils";

/**
 * Волосяная линейка — основной разделитель проекта.
 * Разделение задаётся линией, а не тенью: так строится editorial-вёрстка.
 */
export function Separator({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-rule shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
