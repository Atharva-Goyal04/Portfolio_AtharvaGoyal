import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import SectionHeading from "@/components/shared/section-heading";
import GalleryCard from "@/components/gallery/gallery-card";
import { galleries } from "@/lib/gallery";
import { galleryUnlocked } from "@/lib/gallery-auth";
import { titleFromName } from "@/lib/utils";
import { GALLERY_EMAIL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Client Galleries",
  description:
    "Client photography galleries by Atharva Goyal. Private, password-protected deliveries for portraits, graduations, and events.",
};

interface GalleryPageProps {
  searchParams: Promise<{ category?: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  graduation: "Graduations",
  portrait: "Portraits",
  couples: "Couples",
  events: "Events",
  travel: "Travel",
  street: "Street",
};

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { category } = await searchParams;
  const all = await galleries();
  const filtered = category ? all.filter((g) => g.category === category) : all;

  const cookieStore = await cookies();
  const galleriesWithUnlocked = filtered.map((gallery) => ({
    ...gallery,
    unlocked: galleryUnlocked(cookieStore, gallery),
  }));

  return (
    <section className="min-h-screen pt-28 md:pt-36">
      <div className="container-site pb-24">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <SectionHeading
              eyebrow="Client Delivery"
              title={
                category ? `${CATEGORY_LABELS[category] ?? titleFromName(category)}` : "Galleries"
              }
              description={
                category
                  ? `Client galleries in ${CATEGORY_LABELS[category]?.toLowerCase() ?? category.toLowerCase()}.`
                  : "Every session is delivered as its own private online gallery — easy to browse, easy to share, easy to download."
              }
            />
          </div>
          {category && (
            <Link
              href="/gallery"
              className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70 transition-colors hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" /> All galleries
            </Link>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleriesWithUnlocked.map((gallery, i) => (
              <GalleryCard key={gallery.slug} gallery={gallery} index={i} unlocked={gallery.unlocked} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-line bg-surface/50 py-24 text-center">
            <span className="eyebrow text-brand">No sessions yet</span>
            <p className="max-w-md text-muted text-pretty">
              This is where your delivered sessions will live. Once you&apos;re booked and
              photographed, your private gallery appears here — password-protected,
              downloadable, and easy to share.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wider text-brand-foreground shadow-lg transition-colors hover:bg-brand/90"
            >
              Book a session
            </Link>
            <a
              href={`mailto:${GALLERY_EMAIL}`}
              className="font-mono text-[10px] uppercase tracking-widest text-muted/70 transition-colors hover:text-brand"
            >
              Need help? {GALLERY_EMAIL}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}