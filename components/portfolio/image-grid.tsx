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

export default function ImageGrid({
  items,
  eager = 6,
  className,
}: {
  items: GridItem[];
  eager?: number;
  className?: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const lightboxItems: LightboxItem[] = items.map((img) => ({
    id: img.src,
    src: img.src,
    title: img.title,
    subtitle: img.subtitle ?? "",
    meta: img.meta ?? "",
  }));

  const landscape = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isLandscape(item.src));
  const portrait = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !isLandscape(item.src));

  const renderTile = (entry: { item: GridItem; index: number }, delay: number) => {
    const { item, index } = entry;
    return (
      <motion.button
        key={item.src}
        type="button"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, delay }}
        onClick={() => setLightboxIndex(index)}
        className={cn(
          "group relative block w-full overflow-hidden rounded-xl text-left",
          className,
        )}
      >
        <Photo
          src={item.src}
          alt={item.subtitle ?? item.title}
          ratio={isLandscape(item.src) ? landscapeRatio(item.src) : 3 / 4}
          sizes={
            isLandscape(item.src) ? "(max-width: 640px) 50vw, 50vw" : "(max-width: 640px) 33vw, 33vw"
          }
          className="transition-transform duration-700 group-hover:scale-[1.03]"
          eager={index < eager}
        />
        {item.subtitle && (
          <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-5 font-mono text-[10px] uppercase tracking-widest text-cream/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
            {item.subtitle}
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <div>
      {landscape.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {landscape.map((entry, i) => renderTile(entry, (i % 2) * 0.06))}
        </div>
      )}

      {portrait.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
          {portrait.map((entry, i) => renderTile(entry, (i % 2) * 0.06))}
        </div>
      )}

      <Lightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}