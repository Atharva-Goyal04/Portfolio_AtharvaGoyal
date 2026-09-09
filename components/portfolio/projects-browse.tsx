"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import ProjectCard from "@/components/portfolio/project-card";

const INITIAL_VISIBLE = 9;
const BATCH = 9;

export default function ProjectsBrowse({ projects }: { projects: Project[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const visible = projects.slice(0, visibleCount);
  const hasMore = visibleCount < projects.length;

  return (
    <div>
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
          No projects yet.
        </p>
      )}
    </div>
  );
}