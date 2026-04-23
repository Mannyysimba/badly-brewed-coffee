"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ---------- Button ----------
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:ring-[var(--color-coffee)]",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-coffee)] text-white hover:bg-[var(--color-coffee-dark)]",
        secondary: "bg-[var(--color-bisque)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-bisque)_85%,black)]",
        outline: "bg-transparent border border-[var(--border)] text-fg hover:bg-[var(--bg-elev)]",
        ghost: "bg-transparent text-fg hover:bg-[color-mix(in_oklab,var(--color-bisque)_60%,transparent)]",
        destructive: "bg-[var(--color-err)] text-white hover:brightness-95",
        success: "bg-[var(--color-ok)] text-white hover:brightness-95",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

// ---------- Card ----------
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-fg", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-muted mt-1", className)} {...props} />;
}

// ---------- Input ----------
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] px-3 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee)]/40 focus:border-[var(--color-coffee)]/60 transition",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee)]/40 focus:border-[var(--color-coffee)]/60 transition",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-9 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee)]/40 transition",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-medium text-fg/80 mb-1.5 block", className)} {...props} />;
}

// ---------- Badge ----------
const badgeVariants = cva("inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10.5px] font-semibold uppercase tracking-wide", {
  variants: {
    tone: {
      neutral: "bg-[var(--color-bisque)] text-[var(--color-coffee-dark)]",
      ok: "bg-[var(--color-ok)]/15 text-[var(--color-ok)]",
      warn: "bg-[var(--color-warn)]/15 text-[var(--color-warn)]",
      err: "bg-[var(--color-err)]/15 text-[var(--color-err)]",
      info: "bg-[var(--color-coffee)]/12 text-[var(--color-coffee)]",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

// ---------- Table ----------
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-sm border-separate border-spacing-0", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-2 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-elev)_92%,var(--color-bisque))]",
        className
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-2.5 border-b border-[var(--border)]/70", className)} {...props} />;
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-[color-mix(in_oklab,var(--color-bisque)_40%,transparent)] transition", className)} {...props} />;
}

// ---------- Empty state ----------
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="h-14 w-14 rounded-full bg-[var(--color-bisque)] text-[var(--color-coffee)] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
      {description && <p className="text-xs text-muted mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------- Skeleton ----------
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[color-mix(in_oklab,var(--color-bisque)_70%,transparent)]",
        className
      )}
    />
  );
}
