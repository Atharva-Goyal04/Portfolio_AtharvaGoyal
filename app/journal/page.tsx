import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/shared/section-heading";
import Reveal from "@/components/shared/reveal";
import Photo from "@/components/shared/photo";
import { Button } from "@/components/ui/button";
import { monthYear } from "@/lib/utils";
import { allJournalEntries } from "@/src/data/journal";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Field notes from THE.LUMENCODE — the stories behind the frames, shot around Tempe and across Arizona.",
};

export default function JournalPage() {
  const entries = allJournalEntries();

  return (
    <section className="min-h-screen pt-28 md:pt-36">
      <div className="container-site pb-20">
        <div className="mb-12 md:mb-16">
          <SectionHeading
            eyebrow="Journal"
            title="Field Notes"
            highlight="from the archive"
            description="Short entries on the frames I keep coming back to — where they were shot, what I was chasing, and why they survived the edit."
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {entries.map((entry, i) => (
            <Reveal key={entry.slug} delay={(i % 3) * 0.08}>
              <Link
                href={`/journal/${entry.slug}`}
                className="group block overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <div className="relative overflow-hidden">
                  <Photo
                    src={entry.cover}
                    alt={entry.title}
                    ratio={3 / 4}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="aspect-[3/4] transition-transform duration-700 group-hover:scale-[1.04]"
                    eager={i < 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="eyebrow text-brand">{entry.category}</span>
                    {entry.date && (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        {monthYear(entry.date)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-medium">{entry.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                    {entry.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand">
                    Read the entry <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="container-site pb-24 md:pb-32">
        <Reveal className="flex flex-col items-center gap-6 rounded-3xl border border-line bg-gradient-to-r from-surface to-canvas p-10 text-center md:p-16">
          <span className="eyebrow text-brand">Keep the story going</span>
          <h2 className="max-w-2xl font-display text-3xl font-medium text-balance md:text-5xl">
            Have a session coming up? <em className="text-gradient not-italic">Let&apos;s talk.</em>
          </h2>
          <p className="max-w-xl text-muted">
            Bookings are open for graduations, portraits, and events across the Phoenix metro.
          </p>
          <Link href="/contact">
            <Button size="lg">
              Book a Session <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}