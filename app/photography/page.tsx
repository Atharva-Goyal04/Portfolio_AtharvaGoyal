import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/shared/section-heading";
import Reveal from "@/components/shared/reveal";
import FeaturedWork, { type FeaturedImage } from "@/components/photography/featured-work";
import GalleryCard from "@/components/gallery/gallery-card";
import { Button } from "@/components/ui/button";
import { titleFromName } from "@/lib/utils";
import { galleries } from "@/lib/gallery";
import { imageInfo } from "@/lib/images";

export const metadata: Metadata = {
  title: "Photography",
  description:
    "Photography by Atharva Goyal — portraits, street, graduation sessions, and client galleries around Arizona.",
};

const featured: FeaturedImage[] = [
  "/images/favorite/AG_04204.jpg",
  "/images/favorite/AG_04404.jpg",
  "/images/favorite/DSC04384.jpg",
  "/images/favorite/DSC04424.jpg",
  "/images/favorite/DSC_1249.jpg",
  "/images/favorite/DSC_1317.jpg",
  "/images/favorite/_AG_9030.jpg",
  "/images/favorite/_AG_9152.jpg",
].map((src) => ({
  src,
  title: titleFromName(src.split("/").pop() ?? ""),
  category: "Featured",
}));

export default async function PhotographyPage() {
  const allGalleries = await galleries();

  const featuredGals = allGalleries.slice(0, 3);
  const hasGalleries = allGalleries.length > 0;

  return (
    <>
      <PhotographyHero />

      <section className="py-24 md:py-32">
        <div className="container-site">
          <div className="mb-12">
            <SectionHeading
              eyebrow="Portfolio"
              title="Featured"
              highlight="Work"
              description="A rotating selection from the archive — click any frame to open it fullscreen."
            />
          </div>
          <FeaturedWork images={featured} />
        </div>
      </section>

      {hasGalleries ? (
        <>
          <section className="border-y border-line bg-surface/40 py-24 md:py-32">
            <div className="container-site">
              <div className="mb-12">
                <SectionHeading
                  eyebrow="Client delivery"
                  title="Recent"
                  highlight="Galleries"
                  description="Every session is delivered as its own private gallery."
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {featuredGals.map((gallery, i) => (
                  <GalleryCard key={gallery.slug} gallery={gallery} index={i} />
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="border-y border-line bg-surface/40 py-24 md:py-32">
          <div className="container-site">
            <Reveal className="flex flex-col items-center gap-6 rounded-3xl border border-line bg-canvas p-10 text-center md:p-16">
              <span className="eyebrow text-brand">Client delivery</span>
              <h2 className="max-w-2xl font-display text-3xl font-medium text-balance md:text-5xl">
                Your session&apos;s gallery lands <em className="text-gradient not-italic">here</em>
              </h2>
              <p className="max-w-xl text-muted text-pretty">
                Once you&apos;re booked and photographed, your private gallery appears in this
                space — password-protected, downloadable, and easy to share.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3 font-mono text-xs uppercase tracking-wider text-brand-foreground shadow-lg transition-colors hover:bg-brand/90"
              >
                Book a session <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section className="pb-24 md:pb-32">
        <div className="container-site">
          <Reveal className="flex flex-col items-center gap-6 rounded-3xl border border-line bg-gradient-to-r from-surface to-canvas p-10 text-center md:p-16">
            <h2 className="max-w-2xl font-display text-3xl font-medium text-balance md:text-5xl">
              Have a session coming up? <em className="text-gradient not-italic">Let&apos;s talk.</em>
            </h2>
            <p className="max-w-xl text-muted">
              Bookings are open for graduations, portraits, and events across the Phoenix metro.
            </p>
            <Link href="/contact">
              <Button size="lg">Book a Session</Button>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function PhotographyHero() {
  return (
    <section className="relative overflow-hidden pt-36 md:pt-44">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 50% at 20% 15%, hsl(var(--brand) / 0.09) 0%, transparent 70%)",
        }}
      />
      <div className="container-site relative z-10">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="glow-line w-10" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              Photography
            </span>
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-medium leading-[0.95] tracking-tight text-ink md:text-7xl">
            Light, catalogued in <em className="text-gradient not-italic">frames</em>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
            Portraits, street scenes, film, and client sessions shot around Arizona — light,
            color, and the honest moments between.
          </p>
        </Reveal>
      </div>

      <div className="container-site relative z-10 mt-14 pb-0">
        <Reveal delay={0.1} className="relative overflow-hidden rounded-2xl">
          <Image
            src={imageInfo("/images/favorite/DSC04384.jpg")?.url ?? "/images/favorite/DSC04384.jpg"}
            alt="Desert study — golden hour backlit portrait"
            priority
            sizes="100vw"
            className="h-[38vh] w-full object-cover md:h-[52vh]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-6 md:p-8">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/70">
                Featured Study
              </span>
              <p className="font-display text-xl text-cream md:text-2xl">Desert Study — Golden Hour</p>
            </div>
            <span className="rounded-full bg-cream/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream backdrop-blur">
              Tempe, Arizona
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}