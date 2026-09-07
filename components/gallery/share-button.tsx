"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      throw new Error("share unavailable");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <button
      onClick={share}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors",
        copied
          ? "border-brand bg-brand/10 text-brand"
          : "border-line hover:border-brand hover:text-brand",
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}