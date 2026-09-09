"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";
import ProjectCard from "@/components/portfolio/project-card";

const INITIAL_VISIBLE = 9;
const BATCH = 9;

export interface CategoryTab {
  key: string;
  label: string;
}

export default function ProjectsBrowse({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const tabs: CategoryTab[] = useMemo(() => {
    const categories = [...new Set(projects.map((p) => p.category))]
      .map((cat) => {
        const proj = projects.find((p) => p.category === cat);
        return { key: cat, label: proj?.categoryLabel ?? cat };
      });
    return [
      { key: "all", label: "All" },
      ...categories,
    ];
  }, [projects]);

  const filtered = useMemo(
    () =>
      projects.filter((p) => (active === "all" ? true : p.category === active)),
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

      {visible.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProjectCard key={`${p.category}/${p.slug}`} project={p} />
          ))}
        </div>
      )}

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
          No projects in this category yet.
        </p>
      )}
    </div>
  );
}