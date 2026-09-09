import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ArrowLeft, ArrowDownToLine, Calendar, Clock3, Lock, MapPin } from "lucide-react";
import Reveal from "@/components/shared/reveal";
import GalleryGrid from "@/components/gallery/gallery-grid";
import R2Gallery from "@/components/gallery/r2-gallery";
import PasswordGate from "@/components/gallery/password-gate";
import ShareButton from "@/components/gallery/share-button";
import { Badge } from "@/components/ui/badge";
import { galleryBySlug, isExpired, rawGalleries, resolveGalleryImages } from "@/lib/gallery";
import { galleryUnlocked } from "@/lib/gallery-auth";
import { imageInfo } from "@/lib/images";
import { monthYear } from "@/lib/utils";
import { GALLERY_EMAIL } from "@/lib/utils";

interface GalleryDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const galleries = await rawGalleries();
  return galleries.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: GalleryDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await galleryBySlug(slug);
  if (!gallery) return { title: "Gallery not found" };
  const og = gallery.cover.startsWith("r2:") ? undefined : {
    images: [imageInfo(gallery.cover)?.url ?? gallery.cover],
  };
  return {
    title: gallery.title,
    description: gallery.description ?? `Client gallery — ${gallery.location ?? "Arizona"}.`,
    ...(og ? { openGraph: og } : {}),
  };
}

export default async function GalleryDetailPage({ params }: GalleryDetailProps) {
  const { slug } = await params;
  const gallery = await galleryBySlug(slug);
  if (!gallery) notFound();

  const cookieStore = await cookies();
  const unlocked = galleryUnlocked(cookieStore, gallery);

  const expired = isExpired(gallery);
  const images = resolveGalleryImages(gallery);
  const isR2 = gallery.images.some((src) => src.startsWith("r2:"));
  const photoCount = isR2 ? gallery.images.length : images.length;

  return (
    <section className="min-h-screen pt-28 md:pt-32">
      <div className="container-site pb-24">
        <Link
          href="/gallery"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> All galleries
        </Link>

        {expired ? (
          <ExpiredPanel gallery={gallery} />
        ) : gallery.password && !unlocked ? (
          <Reveal>
            <GalleryHeader gallery={gallery} images={photoCount} locked />
            <PasswordGate slug={gallery.slug} />
          </Reveal>
        ) : (
          <>
            <GalleryHeader
              gallery={gallery}
              images={photoCount}
              unlocked={Boolean(gallery.password)}
            />

            {gallery.description && (
              <p className="mt-6 max-w-2xl leading-relaxed text-muted">{gallery.description}</p>
            )}

            <div className="sticky top-24 z-20 mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface/85 p-3 backdrop-blur-md">
              <a
                href={`/api/gallery/${gallery.slug}/download`}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wider text-brand-foreground shadow-lg transition-colors hover:bg-brand/90"
              >
                <ArrowDownToLine className="h-4 w-4" /> Download All
              </a>
              <ShareButton title={gallery.title} />
              <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-widest text-muted md:block">
                {photoCount} images · {monthYear(gallery.date ?? gallery.expires ?? "")}
              </span>
            </div>

            <div className="mt-12">
              {isR2 ? (
                <R2Gallery slug={gallery.slug} />
              ) : (
                <GalleryGrid images={images} gallerySlug={gallery.slug} />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function GalleryHeader({
  gallery,
  images,
  locked,
  unlocked,
}: {
  gallery: NonNullable<Awaited<ReturnType<typeof galleryBySlug>>>;
  images: number;
  locked?: boolean;
  unlocked?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 border-b border-line pb-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="eyebrow text-brand">
            {gallery.category}
            {images ? ` · ${images} photos` : ""}
          </span>
          {locked && (
            <Badge variant="brand">
              <Lock className="h-3 w-3" /> Protected
            </Badge>
          )}
          {unlocked && (
            <Badge variant="solid">
              <Lock className="h-3 w-3" /> Unlocked
            </Badge>
          )}
        </div>
        <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">
          {gallery.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-wider text-muted">
          {gallery.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {gallery.location}
            </span>
          )}
          {gallery.date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {monthYear(gallery.date)}
            </span>
          )}
          {gallery.expires && (
            <span className="inline-flex items-center gap-1.5 text-ink/60">
              <Clock3 className="h-3.5 w-3.5" /> Available until {monthYear(gallery.expires)}
            </span>
          )}
        </div>
      </div>

      {locked && (
        <p className="max-w-sm font-mono text-xs uppercase tracking-wider text-muted">
          Enter the password you received with your session to view these photos.
        </p>
      )}
    </div>
  );
}

function ExpiredPanel({
  gallery,
}: {
  gallery: NonNullable<Awaited<ReturnType<typeof galleryBySlug>>>;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-line bg-surface p-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl font-medium">{gallery.title} has expired</h2>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted">
          This gallery is no longer available. Email {GALLERY_EMAIL} to re-open your delivery.
        </p>
        {gallery.location && (
          <p className="mt-4 font-mono text-xs text-muted">{gallery.location}</p>
        )}
      </div>
    </div>
  );
}