"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContinueReadingProps {
  preview: React.ReactNode;
  children: React.ReactNode;
}

export default function ContinueReading({ preview, children }: ContinueReadingProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-14 md:space-y-20">
      <div className="relative">
        {preview}
        {!open && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-canvas via-canvas/70 to-transparent"
          />
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="story-rest"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex justify-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="group inline-flex items-center gap-3 rounded-full border border-brand/40 bg-canvas/60 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.25em] text-brand backdrop-blur-sm transition-colors hover:bg-brand hover:text-brand-foreground"
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