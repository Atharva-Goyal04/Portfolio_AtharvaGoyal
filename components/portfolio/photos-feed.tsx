"use client";

import { useMemo, useState } from "react";
import ImageGrid from "@/components/portfolio/image-grid";
import { cn } from "@/lib/utils";
import { allCategories } from "@/lib/projects";

const INITIAL_VISIBLE = 24;
const BATCH = 12;

interface FilterItem {
  key: string;
  label: string;
  count: number;
}

interface CategoryData {
  slug: string;
  label: string;
  projectCount: number;
}

interface FeedImage {
  src: string;
  category: string;
  project: string;
  projectTitle: string;
  camera?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
}

export default function PhotosFeed({ initialImages }: { initialImages: FeedImage[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeProject, setActiveProject] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const categoriesData = useMemo((): CategoryData[] => allCategories(), []);

  const categories = useMemo((): FilterItem[] => {
    const withCounts = categoriesData.map((cat) => ({
      key: cat.slug,
      label: cat.label,
      count: initialImages.filter((img) => img.category === cat.slug).length,
    }));
    return [{ key: "all", label: "All", count: initialImages.length }, ...withCounts];
  }, [initialImages, categoriesData]);

  const projects = useMemo((): FilterItem[] => {
    if (activeCategory === "all") return [];
    const projs = new Map<string, { label: string; count: number }>();
    initialImages
      .filter((img) => img.category === activeCategory)
      .forEach((img) => {
        const key = img.project;
        const current = projs.get(key) || { label: img.projectTitle, count: 0 };
        projs.set(key, { label: current.label, count: current.count + 1 });
      });
    return [
      { key: "all", label: "All", count: initialImages.filter((img) => img.category === activeCategory).length },
      ...Array.from(projs.entries()).map(([key, val]) => ({ key, ...val })),
    ];
  }, [initialImages, activeCategory]);

  const filtered = useMemo(
    () =>
      initialImages.filter((img) => {
        const catMatch = activeCategory === "all" || img.category === activeCategory;
        const projMatch = activeProject === "all" || img.project === activeProject;
        return catMatch && projMatch;
      }),
    [initialImages, activeCategory, activeProject],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = () => setVisibleCount((c) => c + BATCH);
  const resetVisible = () => setVisibleCount(INITIAL_VISIBLE);

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    setActiveProject("all");
    resetVisible();
  };

  const handleProjectChange = (key: string) => {
    setActiveProject(key);
    resetVisible();
  };

  return (
    <section className="min-h-screen pt-28 md:pt-36">
      <div className="container-site pb-20">
        <div className="mb-8 md:mb-12">
          <h1 className="font-display text-4xl font-medium md:text-5xl">Photos</h1>
          <p className="mt-2 text-muted max-w-2xl">
            Every frame in one place — filter by category or project.
          </p>
        </div>

        {/* Category Filter */}
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
        </div>

        {/* Project Filter (only show when category selected) */}
        {activeCategory !== "all" && projects.length > 1 && (
          <div className="mb-6 flex flex-nowrap gap-2 overflow-x-auto pb-2 md:flex-wrap md:pb-0">
            {projects.map((proj) => (
              <button
                key={proj.key}
                type="button"
                onClick={() => handleProjectChange(proj.key)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                  activeProject === proj.key
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-line text-ink/70 hover:text-ink",
                )}
              >
                {proj.label} <span className="ml-2 text-xs opacity-60">({proj.count})</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 text-sm font-mono text-muted">
          Showing {visible.length} of {filtered.length} photos
          {activeCategory !== "all" && ` · ${categories.find((c) => c.key === activeCategory)?.label}`}
          {activeProject !== "all" && ` · ${projects.find((p) => p.key === activeProject)?.label}`}
        </div>

        <ImageGrid
          items={visible.map((img) => ({
            src: img.src,
            title: img.projectTitle,
            subtitle: img.camera,
            meta: [img.lens, img.aperture, img.shutterSpeed, img.iso].filter(Boolean).join(" · "),
          }))}
        />

        {hasMore && (
          <div className="mt-14 flex flex-col items-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-brand/60" />
            <button
              type="button"
              onClick={loadMore}
              className="inline-flex items-center gap-2 rounded-full border border-line px-8 py-3 font-mono text-xs uppercase tracking-wider text-ink/80 transition-colors hover:border-brand hover:text-brand"
            >
              Load More
            </button>
          </div>
        )}

        {visible.length === 0 && (
          <p className="py-24 text-center font-mono text-sm text-muted">
            No photos match the current filters.
          </p>
        )}
      </div>
    </section>
  );
}