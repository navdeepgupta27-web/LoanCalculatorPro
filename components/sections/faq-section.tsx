import { Accordion } from "@/components/ui/accordion";
import type { Faq } from "@/lib/faqs";

import { SectionHeading } from "./section-heading";

export function FaqSection({
  faqs,
  eyebrow = "Questions",
  title = "Frequently asked questions",
  description,
}: {
  faqs: Faq[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <Accordion
        className="mt-8"
        items={faqs.map((f) => ({ question: f.question, answer: f.answer }))}
      />
    </div>
  );
}
