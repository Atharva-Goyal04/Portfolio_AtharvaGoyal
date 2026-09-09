import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, ArrowRight, Camera, MapPin, Sparkles } from "lucide-react";
import Reveal from "@/components/shared/reveal";
import Photo from "@/components/shared/photo";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/shared/section-heading";
import { allProjects } from "@/lib/projects";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
};

const projects = allProjects();

const heroImage = projects.find((p) => p.category === "portraits")?.coverSrc ?? projects[0].coverSrc;
const heroThumb =
  projects.filter((p) => p.category === "portraits")[1]?.coverSrc ?? projects[1].coverSrc;

const CATEGORY_ORDER = ["portraits", "street", "architecture", "miscellaneous-projects"];

const selected = CATEGORY_ORDER.map((cat) => projects.find((p) => p.category === cat))
  .filter((p) => p !== undefined)
  .slice(0, 3)
  .map((p) => ({
    image: p.coverSrc,
    title: p.title,
    category: p.categoryLabel,
    href: `/projects/${p.category}/${p.slug}`,
  }));

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <FeaturedSection />
      <DisciplineSection />
      <GalleryCta />
    </>
  );
}

function HomeHero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 75% 20%, hsl(var(--brand) / 0.10) 0%, transparent 70%)",
        }}
      />
      <span className="pointer-events-none absolute top-20 right-8 hidden select-none font-mono text-[10px] uppercase tracking-[0.3em] text-muted/40 lg:block">
        33.4242° N, 111.9281° W
      </span>

      <div className="container-site relative z-10 pb-24 pt-24 md:pb-28 md:pt-36">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col gap-6 self-center lg:col-span-7 lg:gap-7">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="glow-line w-10" />
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                  Photographer · Tempe, AZ
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[1.02] tracking-tight text-ink text-balance">
                <span className="block">Atharva Goyal</span>
                <span className="mb-1 mt-3 block text-muted">ordinary moments</span>
                <em className="block text-gradient not-italic">seen differently</em>
              </h1>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link href="/projects" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    View the Portfolio
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Work With Me
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted/70">
                Portraits · Graduations · Street &amp; Editorial
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
              <div className="relative overflow-hidden rounded-2xl border border-line shadow-xl shadow-brand/10">
                <Photo
                  src={heroImage}
                  alt="Golden hour portrait"
                  ratio={4 / 5}
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  priority
                  className="transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>

              <div className="absolute -bottom-6 -left-6 hidden w-32 overflow-hidden rounded-xl border-4 border-canvas shadow-lg sm:block">
                <Photo src={heroThumb} alt="Desert study" ratio={1 / 1.15} />
              </div>

              <div className="absolute -top-4 -right-4 hidden rotate-3 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 shadow-md sm:flex">
                <MapPin className="h-3.5 w-3.5 text-brand" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink/70">
                  Tempe, Arizona
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 sm:bottom-8">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted/60">
            Scroll
          </span>
          <ArrowDown className="h-4 w-4 animate-bounce text-muted/60" />
        </div>
      </div>
    </section>
  );
}

function FeaturedSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-site">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="Selected Work" title="Frames that" highlight="caught my eye" />
          <Reveal delay={0.1}>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-brand"
            >
              See the portfolio <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {selected.map((f, i) => (
            <Reveal key={f.image} delay={i * 0.08}>
              <Link href={f.href} className="group block">
                <figure className="relative overflow-hidden rounded-xl border border-line bg-surface">
                  <Photo
                    src={f.image}
                    alt={f.title}
                    ratio={3 / 4}
                    className="rounded-none transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <footer className="flex items-center justify-between px-4 py-3">
                    <figcaption className="font-display text-base text-ink">{f.title}</figcaption>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
                      {f.category.toLowerCase()}
                    </span>
                  </footer>
                </figure>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DisciplineSection() {
  return (
    <section className="border-y border-line bg-surface/50 py-24 md:py-32">
      <div className="container-site">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="flex flex-col gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Camera className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-medium md:text-5xl">
                Portraits &amp; <em className="text-gradient not-italic">sessions</em>
              </h2>
              <p className="max-w-md leading-relaxed text-muted text-pretty">
                Graduations, portraits, and event sessions built around people. Every client
                gallery is delivered as its own private, downloadable space.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand"
              >
                Book your session <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-col gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-medium md:text-5xl">
                Street &amp; <em className="text-gradient not-italic">editorial</em>
              </h2>
              <p className="max-w-md leading-relaxed text-muted text-pretty">
                Candid frames, film experiments, and the quiet geometry of Arizona — shots
                made for the love of the frame, not the brief.
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand"
              >
                Explore the archive <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function GalleryCta() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-site">
        <Reveal className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-surface to-canvas p-8 text-center sm:p-10 lg:p-20">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
          <div className="flex flex-col items-center gap-6">
            <span className="eyebrow text-brand">Let&apos;s make something</span>
            <h2 className="max-w-2xl font-display text-4xl font-medium text-balance md:text-6xl">
              Your session, delivered like a <em className="text-gradient not-italic">premiere</em>
            </h2>
            <p className="max-w-xl leading-relaxed text-muted text-pretty">
              Every photoshoot ships as a private online gallery — password-protected,
              downloadable, and easy to share.
            </p>
            <Link href="/contact">
              <Button size="lg">
                Book a Session <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}