"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { setTeacherVisibility } from "@/lib/actions/teachers";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { cn } from "@/lib/utils";

export function VisibilityToggle({
  locale,
  t,
  teacherId,
  isPublic,
}: {
  locale: Locale;
  t: Dictionary;
  teacherId: string;
  isPublic: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setTeacherVisibility(locale, teacherId, !isPublic);
        })
      }
      className={cn("transition-opacity", isPending && "opacity-50")}
      title={isPublic ? t.crm.teachers.publicBadge : t.crm.teachers.hiddenBadge}
    >
      <Badge tone={isPublic ? "success" : "neutral"} className="cursor-pointer">
        {isPublic ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
        {isPublic ? t.crm.teachers.publicBadge : t.crm.teachers.hiddenBadge}
      </Badge>
    </button>
  );
}
