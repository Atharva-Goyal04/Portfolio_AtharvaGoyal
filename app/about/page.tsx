import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Camera, MapPin } from "lucide-react";
import SectionHeading from "@/components/shared/section-heading";
import Reveal from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/site";

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
                href="/photography"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-wider transition-colors hover:border-brand hover:text-brand"
              >
                See the portfolio
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src="/images/about-me.jpg"
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
      </div>
    </section>
  );
}