"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Photo from "@/components/shared/photo";
import Lightbox, { type LightboxItem } from "@/components/shared/lightbox";

export interface FeaturedImage {
  src: string;
  title: string;
  category: string;
  ratio?: number;
}

export default function FeaturedWork({ images }: { images: FeaturedImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const items: LightboxItem[] = useMemo(
    () =>
      images.map((img) => ({
        id: img.src,
        src: img.src,
        title: img.title,
        subtitle: img.category,
        meta: "",
      })),
    [images],
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <motion.button
            key={img.src}
            type="button"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            onClick={() => setLightboxIndex(i)}
            className={`group relative block w-full overflow-hidden rounded-xl text-left ${
              i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
            }`}
          >
            <Photo
              src={img.src}
              alt={img.title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="transition-transform duration-700 group-hover:scale-[1.03]"
              eager={i < 3}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-cream/60">
                  {img.category}
                </span>
                <h3 className="font-display text-xl font-medium text-cream">{img.title}</h3>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <Lightbox
        items={items}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}