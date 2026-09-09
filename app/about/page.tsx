import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Camera, MapPin } from "lucide-react";
import SectionHeading from "@/components/shared/section-heading";
import Reveal from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { imageInfo } from "@/lib/images";
import { ATHARVA_EMAIL, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About Atharva Goyal — photographer based in Tempe, Arizona.",
};

const photographySkills = [
  "Portraits",
  "Street",
  "Graduations",
  "Events",
  "Lightroom",
  "Color Theory",
  "35mm Film",
];

const gearTimeline = [
  { name: "Sony a7 IV", note: "now in hand", current: true },
  { name: "Sony α6700", note: "the everyday carry", current: false },
  { name: "Sony α3000", note: "first mirrorless", current: false },
  { name: "Nikon D3100", note: "first camera", current: false },
];

const homes = [
  {
    name: "Udaipur",
    place: "Rajasthan, India — where I grew up",
    file: "/maps/udaipur.webp",
  },
  {
    name: "Tempe",
    place: "Arizona, USA — where I live now",
    file: "/maps/tempe.webp",
  },
];

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.author,
  alternateName: "THE.LUMENCODE",
  jobTitle: "Photographer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tempe",
    addressRegion: "Arizona",
    addressCountry: "US",
  },
  email: SITE.email,
  url: SITE.url,
  sameAs: ["https://www.instagram.com/the.lumencode/"],
};

export default function AboutPage() {
  return (
    <section className="min-h-screen pt-28 md:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="container-site pb-24">
        <div className="mb-16 max-w-3xl">
          <SectionHeading
            eyebrow="About"
            title="Behind the"
            highlight="lens"
          />
        </div>

        <div className="grid items-start gap-16 lg:grid-cols-2">
          <Reveal className="flex flex-col gap-6">
            <p className="text-lg leading-relaxed text-ink/80">
              I&apos;m Atharva Goyal — a photographer based in Tempe, Arizona. My work
              explores the interplay of light, color, and the everyday moments that usually
              slip by unnoticed.
            </p>
            <p className="text-lg leading-relaxed text-muted">
              I shoot portraits, street scenes, graduations, and the quiet geometry of
              Arizona — a 50mm and a Sony a7 IV glued to the nearest shoulder. Every client
              session is delivered as a private, password-protected gallery you can browse
              and download at your pace.
            </p>
            <p className="text-lg leading-relaxed text-muted">
              When I&apos;m not behind the lens, you&apos;ll find me rolling film, curating
              playlists, and exploring the desert between shoots.
            </p>

            <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted">
              <MapPin className="h-3.5 w-3.5 text-brand" />
              Tempe, Arizona — open for sessions
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2 text-brand">
                <Camera className="h-4 w-4" />
                <h3 className="font-mono text-xs uppercase tracking-widest">What I shoot</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {photographySkills.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wider text-brand-foreground shadow-lg transition-colors hover:bg-brand/90"
              >
                Book a session <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-wider transition-colors hover:border-brand hover:text-brand"
              >
                See the portfolio
              </Link>
            </div>

            <a
              href={`mailto:${ATHARVA_EMAIL}`}
              className="inline-flex w-fit items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted/70 transition-colors hover:text-brand"
            >
              Recruiters &amp; collaborations → {ATHARVA_EMAIL}
            </a>
          </Reveal>

          <Reveal delay={0.15} className="self-start -mt-8">
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src={imageInfo("/images/about-me.jpg")?.url ?? "/images/about-me.jpg"}
                  alt="Atharva Goyal"
                  width={960}
                  height={1280}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl border border-brand/20" />
            </div>
          </Reveal>
        </div>

        <div className="mt-24 border-t border-line pt-16">
          <Reveal>
            <div className="mb-12 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="glow-line w-10" />
                <span className="eyebrow text-brand">Camera timeline</span>
              </div>
              <h2 className="font-display text-3xl font-medium tracking-tight text-balance md:text-5xl">
                The gear that <em className="text-gradient not-italic">got me here</em>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
              <span
                aria-hidden
                className="absolute bottom-2 left-[7px] top-2 w-px bg-brand/25 md:bottom-auto md:left-0 md:right-0 md:top-[7px] md:h-px md:w-auto"
              />
              {gearTimeline.map((g) => (
                <li key={g.name} className="relative pl-10 md:pl-0 md:pt-10">
                  <span
                    className={
                      g.current
                        ? "absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-brand bg-brand md:top-0"
                        : "absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-brand/40 bg-background md:top-0"
                    }
                  />
                  <p className="font-display text-lg text-ink">{g.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                    {g.note}
                    {g.current && <span className="ml-2 text-brand">· current</span>}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <div className="mt-24 border-t border-line pt-16">
          <Reveal>
            <div className="mb-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="glow-line w-10" />
                <span className="eyebrow text-brand">Two homes</span>
              </div>
              <h2 className="font-display text-3xl font-medium tracking-tight text-balance md:text-5xl">
                One <em className="text-gradient not-italic">light</em>, two addresses
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {homes.map((h, i) => (
              <Reveal key={h.name} delay={i * 0.1}>
                <figure className="group overflow-hidden rounded-2xl border border-line bg-surface p-2">
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src={h.file}
                      alt={h.name}
                      width={1200}
                      height={630}
                      className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3 px-2 py-3">
                    <div>
                      <figcaption className="font-display text-lg text-ink">{h.name}</figcaption>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                        {h.place}
                      </p>
                    </div>
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand" />
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}