"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Instagram, Linkedin, Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { INSTAGRAM_URL, LINKEDIN_URL } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Portfolio" },
  { href: "/photography", label: "Photography" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        scrolled && "border-b border-line bg-canvas/70 backdrop-blur-md",
      )}
    >
      <div className="container-site flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="font-display text-lg tracking-wide text-brand">
          THE.LUMENCODE
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-item font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                isActive(link.href) ? "text-brand" : "text-ink/70 hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hidden rounded-full p-2 text-ink/70 transition-colors hover:text-ink sm:block"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hidden rounded-full p-2 text-ink/70 transition-colors hover:text-ink sm:block"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-full p-2 text-ink/70 transition-colors hover:text-ink"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded-full p-2 text-ink/70 transition-colors hover:text-ink md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-line bg-canvas/95 backdrop-blur-md md:hidden"
          >
            <div className="container-site flex flex-col gap-1 py-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "block py-3 font-mono text-sm uppercase tracking-[0.2em]",
                      isActive(link.href) ? "text-brand" : "text-ink/80",
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}