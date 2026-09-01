import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl whitespace-nowrap " +
  "transition-all duration-200 ease-[var(--ease-out-expo)] select-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] " +
  "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.975]";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-[0_4px_14px_-4px_rgb(79_70_229/0.5)] " +
    "hover:from-brand-500 hover:to-brand-600 hover:shadow-[0_8px_22px_-6px_rgb(79_70_229/0.6)] hover:-translate-y-0.5",
  success:
    "bg-gradient-to-br from-accent-600 to-accent-700 text-white shadow-[0_4px_14px_-4px_rgb(5_150_105/0.5)] " +
    "hover:from-accent-500 hover:to-accent-600 hover:-translate-y-0.5",
  secondary:
    "bg-[var(--bg-subtle)] text-[var(--text)] border border-[var(--border)] " +
    "hover:bg-[var(--surface)] hover:border-[var(--border-strong)] hover:-translate-y-0.5",
  outline:
    "bg-transparent text-brand-600 dark:text-brand-300 border border-brand-300 dark:border-brand-700 " +
    "hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:border-brand-500",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]",
  danger: "bg-red-600 text-white hover:bg-red-500 shadow-[0_4px_14px_-4px_rgb(220_38_38/0.5)]",
};

const SIZES: Record<Size, string> = {
  sm: "text-[0.8125rem] px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3.5",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: Omit<CommonProps, "children">) {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant, size, className, fullWidth, children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps & {
  href: string;
  external?: boolean;
  prefetch?: boolean;
  "aria-label"?: string;
};

export function ButtonLink({
  href,
  external,
  variant,
  size,
  className,
  fullWidth,
  children,
  prefetch,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, fullWidth, className });

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} prefetch={prefetch} {...rest}>
      {children}
    </Link>
  );
}
