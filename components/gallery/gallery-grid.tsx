"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Heart } from "lucide-react";
import Photo from "@/components/shared/photo";
import Lightbox, { type LightboxItem } from "@/components/shared/lightbox";
import type { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function GalleryGrid({ images, gallerySlug }: { images: GalleryImage[]; gallerySlug: string }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const lightboxItems: LightboxItem[] = useMemo(
    () =>
      images.map((img) => ({
        id: img.src,
        src: img.src,
        title: img.title,
        subtitle: img.label,
        meta: img.meta ?? "",
      })),
    [images],
  );

  return (
    <div>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {images.map((img, i) => (
          <motion.div
            key={img.src}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="group relative mb-5 break-inside-avoid"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="relative block w-full overflow-hidden rounded-xl text-left"
            >
              <Photo
                src={img.src}
                alt={img.title}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="transition-transform duration-700 group-hover:scale-[1.03]"
                eager={i < 4}
              />
            </button>
            <div className="pointer-events-none absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <FavoriteButton label={img.title} />
              <a
                href={`/api/gallery/${gallerySlug}/download/${img.src.split("/").pop()}`}
                aria-label={`Download ${img.title}`}
                className="pointer-events-auto rounded-full bg-surface/70 p-2.5 text-cream/80 backdrop-blur-sm transition-colors hover:bg-surface/85 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
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

function FavoriteButton({ label }: { label: string }) {
  const storageKey = `fav:${label}`;
  const [favorite, setFavorite] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(storageKey) === "1";
  });

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, next ? "1" : "0");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={favorite}
      aria-label={`Favorite ${label}`}
      className={cn(
        "pointer-events-auto rounded-full p-2.5 backdrop-blur-sm transition-colors",
        favorite
          ? "bg-brand/90 text-brand-foreground"
          : "bg-surface/70 text-cream/80 hover:bg-surface/85 hover:text-white",
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", favorite && "fill-current")} />
    </button>
  );
}