"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { NativeSelect } from "@/components/ui/input";

/** Переключатель класса в query-параметре ?class= — работает с любой CRM-страницей. */
export function ClassSelector({
  classes,
  current,
  label,
}: {
  classes: { id: string; gradeLevel: number; letter: string }[];
  current?: string;
  label: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <NativeSelect
      aria-label={label}
      defaultValue={current}
      className="w-auto"
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("class", event.target.value);
        router.push(`?${params.toString()}` as never, { scroll: false });
      }}
    >
      {classes.map((c) => (
        <option key={c.id} value={c.id}>
          {c.gradeLevel}
          {c.letter}
        </option>
      ))}
    </NativeSelect>
  );
}
