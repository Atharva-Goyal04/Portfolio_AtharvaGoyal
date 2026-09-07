import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Reveal from "@/components/shared/reveal";
import Photo from "@/components/shared/photo";
import ImageGrid from "@/components/portfolio/image-grid";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { monthYear } from "@/lib/utils";
import {
  allJournalEntries,
  journalEntry,
  journalNeighbors,
} from "@/src/data/journal";

export function generateStaticParams() {
  return allJournalEntries().map((entry) => ({ slug: entry.slug }));
}

type JournalPostProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: JournalPostProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = journalEntry(slug);
  if (!entry) return { title: "Entry not found" };
  return {
    title: `${entry.title} — ${SITE.name}`,
    description: entry.excerpt,
  };
}

export default async function JournalPostPage({ params }: JournalPostProps) {
  const { slug } = await params;
  const entry = journalEntry(slug);
  if (!entry) notFound();

  const { prev, next } = journalNeighbors(entry.slug);
  const meta = [
    entry.date && monthYear(entry.date),
    entry.location,
    entry.camera,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="pt-32 md:pt-40">
      <div className="container-site">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Journal
        </Link>

        <div className="mt-8 max-w-3xl">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand">
            {entry.category}
            {meta ? ` · ${meta}` : ""}
          </span>
          <h1 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink md:text-6xl">
            {entry.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
            {entry.excerpt}
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl">
          <Photo
            src={entry.cover}
            alt={entry.title}
            ratio={3 / 2}
            sizes="100vw"
            className="transition-transform duration-700"
            priority
          />
        </div>

        <Reveal className="mx-auto mt-10 max-w-2xl">
          <div className="flex flex-col gap-5">
            {entry.body.map((paragraph, i) => (
              <p key={i} className="text-lg leading-relaxed text-muted text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        {entry.frames.length > 0 && (
          <Reveal className="mt-16">
            <div className="mb-8">
              <span className="eyebrow text-brand">This set</span>
              <h2 className="mt-2 font-display text-2xl font-medium md:text-4xl">
                Frames from <em className="text-gradient not-italic">the same light</em>
              </h2>
            </div>
            <ImageGrid
              items={entry.frames.map((src) => ({ src, title: "", subtitle: entry.category }))}
            />
          </Reveal>
        )}

        <div className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/journal/${prev.slug}`}
              className="group flex flex-col gap-1 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-brand"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Previous
              </span>
              <span className="font-display text-lg text-ink transition-colors group-hover:text-brand">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/journal/${next.slug}`}
              className="group flex flex-col gap-1 rounded-xl border border-line bg-surface p-5 text-right transition-colors hover:border-brand"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Next <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </span>
              <span className="font-display text-lg text-ink transition-colors group-hover:text-brand">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>

        <Reveal className="mt-16 flex flex-col items-center gap-6 rounded-3xl border border-line bg-gradient-to-r from-surface to-canvas p-10 text-center md:p-14">
          <span className="eyebrow text-brand">Your turn</span>
          <h2 className="max-w-xl font-display text-3xl font-medium text-balance md:text-4xl">
            The next entry could be <em className="text-gradient not-italic">your session</em>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg">
                Book a Session <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </article>
  );
}