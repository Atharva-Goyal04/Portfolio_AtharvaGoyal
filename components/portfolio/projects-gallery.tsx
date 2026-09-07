"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Photo from "@/components/shared/photo";
import Lightbox, { type LightboxItem } from "@/components/shared/lightbox";
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
  const [active, setActive] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const tabs: CategoryTab[] = useMemo(() => {
    const folderTabs = [...new Set(projects.map((p) => p.folder))].map((folder) => ({
      key: folder,
      label: `${CATEGORY_META[folder]?.label ?? folder} (${
        projects.filter((p) => p.folder === folder).length
      })`,
    }));
    const featuredCount = projects.filter((p) => p.featured).length;
    return [
      { key: "all", label: `All (${projects.length})` },
      ...folderTabs,
      ...(featuredCount ? [{ key: "featured", label: `Featured (${featuredCount})` }] : []),
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

  const lightboxItems: LightboxItem[] = useMemo(
    () =>
      visible.map((p) => ({
        id: p.image,
        src: p.image,
        title: p.title,
        subtitle: p.category,
        meta: [p.location, monthYear(p.date), p.camera].filter(Boolean).join(" · "),
      })),
    [visible],
  );

  const switchCategory = (key: string) => {
    setActive(key);
    setVisibleCount(INITIAL_VISIBLE);
    setLightboxIndex(-1);
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

      <MasonryProjects
        projects={visible}
        onOpen={(i) => setLightboxIndex(i)}
      />

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

      <Lightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}

function MasonryProjects({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (index: number) => void;
}) {
  return (
    <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
      {projects.map((p, i) => (
        <motion.button
          key={p.image}
          type="button"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
          onClick={() => onOpen(i)}
          className="group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-xl text-left"
        >
          <Photo
            src={p.image}
            alt={p.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="transition-transform duration-700 group-hover:scale-[1.03]"
            eager={i < 4}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-cream/60">
                {p.category}
              </span>
              <h3 className="font-display text-xl font-medium text-cream">{p.title}</h3>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-cream/60">
                {[p.location, p.date && monthYear(p.date)].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}