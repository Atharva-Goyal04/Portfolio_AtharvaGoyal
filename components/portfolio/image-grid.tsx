"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Photo from "@/components/shared/photo";
import Lightbox, { type LightboxItem } from "@/components/shared/lightbox";
import { imageInfo } from "@/lib/images";
import { cn } from "@/lib/utils";

export interface GridItem {
  src: string;
  title: string;
  subtitle?: string;
  meta?: string;
  iso?: string;
  shutterSpeed?: string;
  aperture?: string;
}

function isLandscape(src: string): boolean {
  const info = imageInfo(src);
  if (!info) return false;
  return info.width > info.height;
}

function landscapeRatio(src: string): number {
  const info = imageInfo(src);
  if (!info) return 16 / 9;
  return Math.min(Math.max(info.width / info.height, 1.1), 2.4);
}

interface ImageGridProps {
  items: GridItem[];
  eager?: number;
  className?: string;
  disableSort?: boolean;
  columns?: 2 | 3 | 4;
}

const COLUMN_CLASS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export default function ImageGrid({
  items,
  eager = 6,
  className,
  disableSort = false,
  columns = 3,
}: ImageGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const ordered = disableSort
    ? items
    : [...items].sort(
        (a, b) => (isLandscape(b.src) ? 1 : 0) - (isLandscape(a.src) ? 1 : 0),
      );

  const lightboxItems: LightboxItem[] = ordered.map((img) => ({
    id: img.src,
    src: img.src,
    title: img.title,
    subtitle: img.subtitle ?? "",
    meta: img.meta ?? "",
  }));

  return (
    <div>
      <div className={cn("grid gap-3 sm:gap-4", COLUMN_CLASS[columns])}>
        {ordered.map((img, i) => {
          const wide = isLandscape(img.src);
          return (
            <motion.button
              key={img.src}
              layout
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setLightboxIndex(i)}
              className={cn(
                "group relative block w-full overflow-hidden rounded-xl text-left",
                className,
              )}
            >
              <Photo
                src={img.src}
                alt={img.subtitle ?? img.title}
                ratio={wide ? landscapeRatio(img.src) : 3 / 4}
                sizes={{ 2: "50vw", 3: "33vw", 4: "25vw" }[columns]}
                className="transition-transform duration-700 group-hover:scale-[1.03]"
                eager={i < eager}
              />
              {img.subtitle && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-canvas/85 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <div className="flex w-full items-end justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-cream/80">
                      {img.subtitle}
                    </span>
                    {[img.iso, img.shutterSpeed, img.aperture].some(Boolean) && (
                      <span className="font-mono text-[10px] tracking-widest text-cream/70">
                        {[img.iso, img.shutterSpeed, img.aperture].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
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