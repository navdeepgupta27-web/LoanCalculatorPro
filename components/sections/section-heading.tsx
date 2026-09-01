import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300">
          {eyebrow}
        </span>
      )}
      <Tag
        className={cn(
          "font-display font-extrabold tracking-tight text-[var(--text)]",
          Tag === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-2xl sm:text-3xl lg:text-4xl",
        )}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            "text-[1.0625rem] leading-relaxed text-[var(--text-secondary)]",
            align === "center" ? "max-w-2xl" : "max-w-2xl",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
