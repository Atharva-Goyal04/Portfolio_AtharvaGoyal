"use client";

import { useEffect, useState } from "react";

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

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {images.map((image) => (
        <figure key={image.src} className="group overflow-hidden rounded-xl bg-ink/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.name}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </figure>
      ))}
    </div>
  );
}