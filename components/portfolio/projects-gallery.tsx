"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import ImageGrid from "@/components/portfolio/image-grid";
import { cn, monthYear } from "@/lib/utils";
import type { Project } from "@/lib/types";
import { CATEGORY_META } from "@/src/data/project-metadata";

const INITIAL_VISIBLE = 12;
const BATCH = 12;

export interface CategoryTab {
  key: string;
  label: string;
}

export default function ProjectsGallery({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<string>(
    () => (projects.some((p) => p.featured) ? "featured" : "all"),
  );
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const tabs: CategoryTab[] = useMemo(() => {
    const folderTabs = [...new Set(projects.map((p) => p.folder))]
      .filter((folder) => folder !== "favorite")
      .map((folder) => ({
        key: folder,
        label: CATEGORY_META[folder]?.label ?? folder,
      }));
    const hasFeatured = projects.some((p) => p.featured);
    return [
      ...(hasFeatured ? [{ key: "featured", label: "Featured" }] : []),
      { key: "all", label: "All" },
      ...folderTabs,
    ];
  }, [projects]);

  const filtered = useMemo(
    () =>
      projects.filter((p) =>
        active === "all" ? true : active === "featured" ? p.featured : p.folder === active,
      ),
    [projects, active],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const switchCategory = (key: string) => {
    setActive(key);
    setVisibleCount(INITIAL_VISIBLE);
  };

  return (
    <div>
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 md:flex-wrap md:pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => switchCategory(tab.key)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
              active === tab.key
                ? "border-brand bg-brand text-brand-foreground"
                : "border-line text-ink/70 hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <ImageGrid
          items={visible.map((p) => ({
            src: p.image,
            title: p.title,
            subtitle: p.category,
            meta: [p.location, p.date && monthYear(p.date)].filter(Boolean).join(" · "),
          }))}
          disableSort={active === "featured"}
        />
      </div>

      {hasMore && (
        <div className="mt-14 flex flex-col items-center gap-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-brand/60" />
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + BATCH)}
            className="inline-flex items-center gap-2 rounded-full border border-line px-8 py-3 font-mono text-xs uppercase tracking-wider text-ink/80 transition-colors hover:border-brand hover:text-brand"
          >
            Load More <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {visible.length === 0 && (
        <p className="py-24 text-center font-mono text-sm text-muted">
          Nothing in this category yet.
        </p>
      )}
    </div>
  );
}