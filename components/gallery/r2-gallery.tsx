"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import Lightbox, { type LightboxItem } from "@/components/shared/lightbox";
import { cn } from "@/lib/utils";

interface SignedImage {
  src: string;
  name: string;
  url: string;
}

interface R2GalleryProps {
  slug: string;
}

export default function R2Gallery({ slug }: R2GalleryProps) {
  const [images, setImages] = useState<SignedImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/gallery/${slug}/images`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`gallery unavailable (${res.status})`);
        return res.json() as Promise<{ images: SignedImage[] }>;
      })
      .then((data) => setImages(data.images))
      .catch((err: unknown) => {
        if ((err as { name?: string }).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Failed to load gallery");
        }
      });
    return () => controller.abort();
  }, [slug]);

  if (error) {
    return (
      <p className="py-16 text-center font-mono text-xs uppercase tracking-widest text-muted">
        {error}
      </p>
    );
  }

  if (!images) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" aria-busy="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-ink/5" />
        ))}
      </div>
    );
  }

  const lightboxItems: LightboxItem[] = images.map((image) => ({
    id: image.url,
    src: image.url,
    title: image.name.replace(/\.[a-z0-9]+$/i, ""),
  }));

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {images.map((image, i) => (
          <div key={image.src} className="group relative overflow-hidden rounded-xl bg-ink/5">
            <button
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="relative block w-full text-left"
              aria-label={`Open ${image.name}`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </button>
            <a
              href={image.url}
              download
              aria-label={`Download ${image.name}`}
              className={cn(
                "pointer-events-none absolute right-3 top-3 rounded-full p-2.5 text-cream/80 opacity-0 backdrop-blur-sm transition-opacity duration-300",
                "bg-surface/70 hover:bg-surface/85 hover:text-white group-hover:opacity-100 group-focus-within:opacity-100",
              )}
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>

      <Lightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}