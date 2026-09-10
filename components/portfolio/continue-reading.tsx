"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContinueReadingProps {
  preview: React.ReactNode;
  children: React.ReactNode;
}

export default function ContinueReading({ preview, children }: ContinueReadingProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-14 md:space-y-20">
      {preview}
      {open && children}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="group inline-flex items-center gap-3 rounded-full border border-brand/40 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.25em] text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
          aria-expanded={open}
        >
          {open ? "Show Less" : "Continue Reading"}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")}
          />
        </button>
      </div>
    </div>
  );
}