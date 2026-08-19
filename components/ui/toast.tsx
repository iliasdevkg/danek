"use client";

import * as Primitive from "@radix-ui/react-toast";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ToastTone = "info" | "success" | "danger";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Мс до автозакрытия. Ошибку показываем дольше — её надо успеть прочитать. */
  duration?: number;
};

type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

/** Показывает уведомление. Бросает, если провайдер не смонтирован — тихо терять нельзя. */
export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast используется вне <ToastProvider>");
  return push;
}

const TONE_ICON = {
  info: Info,
  success: CheckCircle2,
  danger: AlertTriangle,
} as const;

const TONE_CLASS: Record<ToastTone, string> = {
  info: "text-accent",
  success: "text-success",
  danger: "text-danger",
};

export function ToastProvider({
  children,
  closeLabel,
}: {
  children: ReactNode;
  closeLabel: string;
}) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((toast: ToastInput) => {
    // Монотонный счётчик вместо random: id стабилен и не конфликтует при всплеске.
    setItems((prev) => [...prev, { ...toast, id: (prev.at(-1)?.id ?? 0) + 1 }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      <Primitive.Provider swipeDirection="right" duration={5000}>
        {children}

        {items.map((item) => {
          const Icon = TONE_ICON[item.tone ?? "info"];

          return (
            <Primitive.Root
              key={item.id}
              duration={item.duration ?? (item.tone === "danger" ? 8000 : 5000)}
              onOpenChange={(open) => {
                if (!open) dismiss(item.id);
              }}
              className={cn(
                "border-rule bg-paper-raised flex items-start gap-3 rounded-md border p-4",
                "shadow-(--shadow-overlay)",
                "data-[state=open]:animate-[toast-in_240ms_var(--ease-entrance)_both]",
                "data-[state=closed]:animate-[toast-out_160ms_var(--ease-exit)_both]",
                // Свайп пальцем закрывает уведомление и следует за пальцем.
                "data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
                "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
                "data-[swipe=end]:animate-[toast-out_160ms_var(--ease-exit)_both]",
              )}
            >
              <Icon
                className={cn("mt-0.5 size-4.5 shrink-0", TONE_CLASS[item.tone ?? "info"])}
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <Primitive.Title className="text-small text-ink font-medium">
                  {item.title}
                </Primitive.Title>
                {item.description ? (
                  <Primitive.Description className="text-caption text-ink-muted">
                    {item.description}
                  </Primitive.Description>
                ) : null}
              </div>
              <Primitive.Close
                className="text-ink-faint hover:bg-paper-sunken hover:text-ink -mt-1 -mr-1 ml-auto grid size-8 shrink-0 place-items-center rounded-sm transition-colors"
                aria-label={closeLabel}
              >
                <X className="size-3.5" aria-hidden="true" />
              </Primitive.Close>
            </Primitive.Root>
          );
        })}

        <Primitive.Viewport
          className={cn(
            "fixed z-100 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 outline-none",
            // На телефоне уведомления сверху: снизу их закрывает клавиатура.
            "top-4 right-4 left-4 w-auto sm:top-auto sm:bottom-6 sm:left-auto sm:w-96",
            "pb-[env(safe-area-inset-bottom)]",
          )}
        />
      </Primitive.Provider>
    </ToastContext.Provider>
  );
}
