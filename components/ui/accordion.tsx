"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface AccordionItem {
  question: string;
  answer: ReactNode;
}

/**
 * FAQ accordion.
 *
 * Every answer stays in the DOM — collapsed panels are hidden with a grid-rows
 * transition rather than being unmounted — so crawlers and Ctrl+F still find
 * the text, which is the whole point of publishing an FAQ.
 */
export function Accordion({
  items,
  defaultOpen = 0,
  className,
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={cn(
              "card overflow-hidden transition-all duration-300",
              isOpen && "border-brand-300 shadow-[var(--shadow-glow)] dark:border-brand-700",
            )}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span
                  className={cn(
                    "font-display text-[0.975rem] font-semibold transition-colors sm:text-base",
                    isOpen ? "text-brand-700 dark:text-brand-200" : "text-[var(--text)]",
                  )}
                >
                  {item.question}
                </span>
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300",
                    isOpen
                      ? "rotate-180 border-brand-400 bg-brand-500 text-white"
                      : "border-[var(--border)] text-[var(--text-muted)]",
                  )}
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 7.5 5 5 5-5" />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-expo)]",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
