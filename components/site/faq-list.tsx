"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqEntry = { question: string; answer: string };

/**
 * Список частых вопросов.
 *
 * `type="single"` с `collapsible`: открыт ровно один ответ, и его можно
 * закрыть. Раскрывать всё сразу здесь незачем — родитель ищет свой вопрос,
 * а не читает страницу подряд, и десять открытых панелей только удлиняют
 * прокрутку.
 *
 * Первый вопрос открыт по умолчанию: так сразу видно, что блок
 * интерактивный, и не приходится угадывать, что строки нажимаются.
 */
export function FaqList({ items }: { items: FaqEntry[] }) {
  if (items.length === 0) return null;

  return (
    <Accordion type="single" collapsible defaultValue="faq-0" className="flex flex-col gap-3">
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`faq-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
