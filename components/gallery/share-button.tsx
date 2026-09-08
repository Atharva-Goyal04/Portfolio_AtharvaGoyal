"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Share2,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const encode = encodeURIComponent;

export default function ShareButton({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url: window.location.href });
    } catch {
      setOpen(true);
    }
  };

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = encode(`${title} — check out this gallery`);

  const options: {
    label: string;
    icon: typeof Copy;
    href?: string;
    onClick?: () => void;
  }[] = [
    { label: "Copy link", icon: Copy, onClick: copyLink },
    {
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${encode(title)}&body=${text}%0A${encode(url)}`,
    },
    {
      label: "X / Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encode(url)}`,
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${text}%20${encode(url)}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encode(url)}`,
    },
  ];

  const button = (
    <button
      onClick={() => {
        if (typeof navigator.share === "function") nativeShare();
        else setOpen((o) => !o);
      }}
      aria-expanded={open}
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

  return (
    <div ref={rootRef} className="relative">
      {button}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-line bg-surface/95 p-1.5 shadow-2xl backdrop-blur-md">
          <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            Share this gallery
          </p>
          <div className="flex flex-col">
            {options.map((option) => (
              <span key={option.label}>
                {option.href ? (
                  <a
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/80 transition-colors hover:bg-brand/10 hover:text-brand"
                  >
                    <option.icon className="h-4 w-4 text-brand" />
                    {option.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      option.onClick?.();
                      setTimeout(() => setOpen(false), 900);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink/80 transition-colors hover:bg-brand/10 hover:text-brand"
                  >
                    <option.icon className="h-4 w-4 text-brand" />
                    {copied && option.label === "Copy link" ? "Copied!" : option.label}
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}