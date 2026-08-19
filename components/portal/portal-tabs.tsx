"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import type { ReactNode } from "react";

export function PortalTabs({
  t,
  diary,
  payments,
  announcements,
}: {
  t: Dictionary;
  diary: ReactNode;
  payments: ReactNode | null;
  announcements: ReactNode;
}) {
  return (
    <Tabs defaultValue="diary">
      <TabsList>
        <TabsTrigger value="diary">{t.portal.tabs.diary}</TabsTrigger>
        {payments ? <TabsTrigger value="payments">{t.portal.tabs.payments}</TabsTrigger> : null}
        <TabsTrigger value="announcements">{t.portal.tabs.announcements}</TabsTrigger>
      </TabsList>

      <TabsContent value="diary">{diary}</TabsContent>
      {payments ? <TabsContent value="payments">{payments}</TabsContent> : null}
      <TabsContent value="announcements">{announcements}</TabsContent>
    </Tabs>
  );
}
