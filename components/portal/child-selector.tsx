"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { NativeSelect } from "@/components/ui/input";
import type { MyChild } from "@/lib/crm/parent-data";

export function ChildSelector({
  options,
  current,
  label,
}: {
  options: MyChild[];
  current: string;
  label: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (options.length <= 1) return null;

  return (
    <NativeSelect
      aria-label={label}
      value={current}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("child", event.target.value);
        router.push(`?${params.toString()}` as never, { scroll: false });
      }}
      className="w-auto"
    >
      {options.map((child) => (
        <option key={child.id} value={child.id}>
          {child.fullName}
          {child.className ? ` · ${child.className}` : ""}
        </option>
      ))}
    </NativeSelect>
  );
}
