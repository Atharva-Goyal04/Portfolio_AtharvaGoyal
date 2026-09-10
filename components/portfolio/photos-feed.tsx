"use client";

import { useEffect, useMemo, useState } from "react";
import ImageGrid from "@/components/portfolio/image-grid";
import { cn } from "@/lib/utils";
import { CATEGORY_ORDER } from "@/lib/projects";

const INITIAL_VISIBLE = 24;
const BATCH = 12;
const COLS_KEY = "photos-grid-columns";

interface FilterItem {
  key: string;
  label: string;
  count: number;
}

interface FeedImage {
  src: string;
  category: string;
  label: string;
  project: string;
  projectTitle: string;
  camera?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
}

function fileName(src: string): string {
  return src.split("/").pop() ?? "";
}

export default function PhotosFeed({ initialImages }: { initialImages: FeedImage[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("featured");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [columns, setColumns] = useState<2 | 3 | 4>(3);

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(COLS_KEY));
      if (stored === 2 || stored === 3 || stored === 4) setColumns(stored);
    } catch {}
  }, []);

  const categories = useMemo((): FilterItem[] => {
    const byKey = new Map<string, { label: string; count: number }>();
    for (const img of initialImages) {
      const cur = byKey.get(img.category) ?? { label: img.label, count: 0 };
      cur.count++;
      byKey.set(img.category, cur);
    }

    return CATEGORY_ORDER.map((key) => {
      const c = byKey.get(key);
      return c ? { key, ...c } : undefined;
    }).filter((c): c is FilterItem => Boolean(c));
  }, [initialImages]);

  const featured = useMemo(
    () => initialImages.filter((img) => img.category === "featured"),
    [initialImages],
  );

  // In "All"/category views, drop Featured copies whose file already exists in
  // a real project so each photo appears exactly once (except in Featured view).
  const pool = useMemo((): FeedImage[] => {
    if (activeCategory === "featured") return featured;

    const base =
      activeCategory === "all"
        ? initialImages
        : initialImages.filter((img) => img.category === activeCategory);

    if (activeCategory === "all") {
      const nonFeatured = base.filter((img) => img.category !== "featured");
      const files = new Set(nonFeatured.map((img) => fileName(img.src)));
      return [...nonFeatured, ...base.filter((img) => img.category === "featured" && !files.has(fileName(img.src)))];
    }
    return base;
  }, [initialImages, featured, activeCategory]);

  const totalCount = useMemo(() => {
    const nonFeatured = initialImages.filter((img) => img.category !== "featured");
    const files = new Set(nonFeatured.map((img) => fileName(img.src)));
    return nonFeatured.length + featured.filter((img) => !files.has(fileName(img.src))).length;
  }, [initialImages, featured]);

  const visible = pool.slice(0, visibleCount);
  const hasMore = visibleCount < pool.length;

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    setVisibleCount(INITIAL_VISIBLE);
  };

  const handleColumnsChange = (cols: 2 | 3 | 4) => {
    setColumns(cols);
    try {
      localStorage.setItem(COLS_KEY, String(cols));
    } catch {}
  };

  return (
    <section className="min-h-screen pt-28 md:pt-36">
      <div className="container-site pb-20">
        <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-medium md:text-5xl">Photos</h1>
            <p className="mt-2 text-muted max-w-2xl">
              Every frame in one place — curated picks first, then browse by category.
            </p>
          </div>

          {/* Grid density selector */}
          <div className="flex items-center gap-4 self-start">
            <span
              className="hidden font-mono text-[11px] uppercase tracking-widest text-muted sm:block"
              aria-live="polite"
            >
              {visible.length}/{pool.length}
            </span>
            <div
              className="flex items-center gap-1 rounded-full border border-line p-1"
              role="group"
              aria-label="Grid columns"
            >
              {([2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleColumnsChange(n)}
                  aria-pressed={columns === n}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
                    columns === n ? "bg-brand text-brand-foreground" : "text-ink/70 hover:text-ink",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category filter — Featured first, All rightmost */}
        <div className="mb-6 flex flex-nowrap gap-2 overflow-x-auto pb-2 md:flex-wrap md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategoryChange(cat.key)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                activeCategory === cat.key
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-line text-ink/70 hover:text-ink",
              )}
            >
              {cat.label} <span className="ml-2 text-xs opacity-60">({cat.count})</span>
            </button>
          ))}
          <button
            key="all"
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
              activeCategory === "all"
                ? "border-brand bg-brand text-brand-foreground"
                : "border-line text-ink/70 hover:text-ink",
            )}
          >
            All <span className="ml-2 text-xs opacity-60">({totalCount})</span>
          </button>
        </div>

        <ImageGrid
          columns={columns}
          items={visible.map((img) => ({
            src: img.src,
            title: img.projectTitle,
            subtitle: img.camera,
            meta: [img.lens, img.aperture, img.shutterSpeed, img.iso].filter(Boolean).join(" · "),
            iso: img.iso,
            shutterSpeed: img.shutterSpeed,
            aperture: img.aperture,
          }))}
        />

        {hasMore && (
          <div className="mt-14 flex flex-col items-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-brand/60" />
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + BATCH)}
              className="inline-flex items-center gap-2 rounded-full border border-line px-8 py-3 font-mono text-xs uppercase tracking-wider text-ink/80 transition-colors hover:border-brand hover:text-brand"
            >
              Load More
            </button>
          </div>
        )}

        {visible.length === 0 && (
          <p className="py-24 text-center font-mono text-sm text-muted">
            No photos match the current filter.
          </p>
        )}
      </div>
    </section>
  );
}