import Link from "next/link";
import { CONTACT_EMAIL, INSTAGRAM_URL, LINKEDIN_URL } from "@/lib/utils";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/photography", label: "Photography" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-canvas/60">
      <div className="container-site flex flex-col justify-between gap-10 py-14 md:flex-row md:items-start">
        <div className="space-y-3">
          <span className="font-display text-lg tracking-wide text-brand">THE.LUMENCODE</span>
          <p className="max-w-xs font-mono text-xs leading-relaxed text-muted">
            Photography by Atharva Goyal — light, color, and the moments in between.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/80 transition-colors hover:border-brand/60 hover:text-brand"
          >
            Work with me →
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <span className="mb-2 eyebrow text-muted">Navigate</span>
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-widest text-ink/70 transition-colors hover:text-brand"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="mb-2 eyebrow text-muted">Connect</span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-mono text-xs uppercase tracking-widest text-ink/70 transition-colors hover:text-brand"
          >
            Email
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-ink/70 transition-colors hover:text-brand"
          >
            Instagram
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-ink/70 transition-colors hover:text-brand"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-5 md:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
            © {new Date().getFullYear()} THE.LUMENCODE
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted/50">
            Tempe, Arizona
          </p>
        </div>
      </div>
    </footer>
  );
}