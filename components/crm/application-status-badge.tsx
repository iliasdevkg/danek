import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/lib/supabase/database.types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { VariantProps } from "class-variance-authority";

const TONE: Record<ApplicationStatus, NonNullable<VariantProps<typeof badgeVariants>["tone"]>> = {
  new: "accent",
  contacted: "accent",
  trial_scheduled: "warning",
  trial_done: "warning",
  accepted: "success",
  enrolled: "success",
  rejected: "danger",
  lost: "neutral",
};

export function ApplicationStatusBadge({
  status,
  t,
}: {
  status: ApplicationStatus;
  t: Dictionary;
}) {
  return <Badge tone={TONE[status]}>{t.crm.applications.columns[status]}</Badge>;
}
