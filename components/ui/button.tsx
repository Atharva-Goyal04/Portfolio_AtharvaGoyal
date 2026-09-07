import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-mono text-xs uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-foreground shadow-lg hover:bg-brand/90",
        outline: "border border-line text-ink hover:bg-surface",
        ghost: "hover:bg-surface",
        cream: "bg-cream text-brand-foreground shadow-lg hover:bg-cream/90",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };