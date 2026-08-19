"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";

import { Input, NativeSelect } from "@/components/ui/input";
import type { ClassOption } from "@/lib/crm/students-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { StudentStatus } from "@/lib/supabase/database.types";

const STATUSES: StudentStatus[] = ["active", "graduated", "expelled", "academic_leave"];

/**
 * Фильтры списка учеников живут в URL, а не в React-состоянии.
 *
 * Так ссылку на «7 класс, отчисленные» можно скопировать коллеге, а обновление
 * страницы не сбрасывает фильтр — обычное свойство обычной ссылки, которое
 * пропадает, стоит перенести фильтры в useState.
 */
export function StudentsFilters({ classes, t }: { classes: ClassOption[]; t: Dictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

    startTransition(() => {
      router.push(`?${params.toString()}` as never, { scroll: false });
    });
  }

  // Поиск обновляет URL не на каждое нажатие, а через паузу — иначе набор
  // «Айгүл» породил бы пять переходов вместо одного.
  function setSearchDebounced(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("search", value), 300);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search className="text-ink-faint pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(event) => setSearchDebounced(event.target.value)}
          placeholder={t.crm.students.searchPlaceholder}
          className="pl-9"
        />
      </div>

      <NativeSelect
        defaultValue={searchParams.get("class") ?? ""}
        onChange={(event) => setParam("class", event.target.value)}
        className="w-auto"
      >
        <option value="">{t.crm.students.allClasses}</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.gradeLevel}
            {c.letter}
          </option>
        ))}
      </NativeSelect>

      <NativeSelect
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(event) => setParam("status", event.target.value)}
        className="w-auto"
      >
        <option value="">{t.crm.students.allStatuses}</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {t.crm.students.status[status]}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
