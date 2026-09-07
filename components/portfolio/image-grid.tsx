"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Photo from "@/components/shared/photo";
import Lightbox, { type LightboxItem } from "@/components/shared/lightbox";
import { cn } from "@/lib/utils";

export interface GridItem {
  src: string;
  title: string;
  subtitle?: string;
  meta?: string;
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

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {items.map((img, i) => (
          <motion.button
            key={img.src}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
            onClick={() => setLightboxIndex(i)}
            className={cn(
              "group relative block w-full overflow-hidden rounded-xl text-left",
              className,
            )}
          >
            <Photo
              src={img.src}
              alt={img.title}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              className="transition-transform duration-700 group-hover:scale-[1.03]"
              eager={i < eager}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {img.subtitle && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-cream/60">
                    {img.subtitle}
                  </span>
                )}
                <h3 className="font-display text-xl font-medium text-cream">{img.title}</h3>
                {img.meta && (
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-cream/60">
                    {img.meta}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
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