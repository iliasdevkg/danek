"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { THEME_STORAGE_KEY, type ThemePreference } from "@/lib/site";
import { cn } from "@/lib/utils";

const ORDER: ThemePreference[] = ["system", "light", "dark"];

const ICON = { system: Monitor, light: Sun, dark: Moon } as const;

function apply(preference: ThemePreference) {
  const resolved =
    preference === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preference;

  document.documentElement.dataset.theme = resolved;
}

/**
 * Переключатель темы — одна кнопка с тремя состояниями по кругу:
 * как в системе → светлая → тёмная.
 *
 * Меню из трёх пунктов здесь не окупается: подпись текущего состояния
 * читается с иконки, а весь компонент укладывается в пару сотен байт.
 */
export function ThemeToggle({
  labels,
  className,
}: {
  labels: { label: string; light: string; dark: string; system: string; toggle: string };
  className?: string;
}) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  // localStorage не существует на сервере: прочитать его в ленивом инициализаторе
  // useState означало бы разное первое значение на сервере и на клиенте — React
  // тут же пожаловался бы на расхождение гидратации. Правильный порядок — отрисовать
  // нейтральное состояние (как на сервере), затем эффектом подставить настоящее.
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- гидратация: см. комментарий выше
    setPreference(stored === "light" || stored === "dark" ? stored : "system");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    /*
     * Тему проставляем сразу, а не только по событию системы.
     *
     * Атрибут на <html> ставит инлайн-скрипт при загрузке документа, и обычно
     * этого достаточно. Но React может пересобрать дерево документа целиком —
     * так происходит при смене языка, когда меняется сегмент маршрута, — и
     * тогда <html> возвращается к серверному значению data-theme="light".
     * Скрипт при этом не выполняется повторно: по спецификации HTML скрипт,
     * вставленный не парсером, не запускается. Без этой строки тёмная тема
     * после смены языка молча превращалась бы в светлую.
     */
    apply(preference);

    if (preference !== "system") return;

    // «Как в системе» продолжает следить за настройкой телефона: вечером
    // включилась тёмная тема — сайт потемнел без перезагрузки.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => apply("system");

    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [mounted, preference]);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length];
    setPreference(next);

    if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);

    apply(next);
  }

  const Icon = ICON[preference];
  const stateLabel = labels[preference];

  return (
    <button
      type="button"
      onClick={cycle}
      // До гидратации подпись нейтральная — она не должна врать о состоянии.
      aria-label={mounted ? `${labels.toggle}: ${stateLabel}` : labels.toggle}
      title={mounted ? stateLabel : labels.toggle}
      className={cn(
        "text-ink-muted grid size-9 place-items-center rounded-sm",
        "hover:bg-paper-sunken hover:text-ink transition-colors duration-[150ms]",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
