"use client";

import { useState } from "react";
import { ChevronDown, Camera, Aperture, Sun, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, ImageInfo } from "@/lib/types";

interface ProjectStoryProps {
  project: Project;
  images: ImageInfo[];
}

export default function ProjectStory({ project, images }: ProjectStoryProps) {
  const [expanded, setExpanded] = useState(false);

  // Aggregate technical specs from all images in the project
  const cameras = [...new Set(images.map((i) => i.camera).filter(Boolean))];
  const lenses = [...new Set(images.map((i) => i.lens).filter(Boolean))];
  const focalLengths = [...new Set(images.map((i) => i.focalLength).filter(Boolean))];
  const apertures = [...new Set(images.map((i) => i.aperture).filter(Boolean))];
  const shutters = [...new Set(images.map((i) => i.shutterSpeed).filter(Boolean))];
  const isos = [...new Set(images.map((i) => i.iso).filter(Boolean))];
  const isFilm = images.some((i) => i.isFilm);

  return (
    <div className="mb-10 border border-line rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-canvas/50 hover:bg-canvas/70 transition-colors text-left"
      >
        <span className="font-display text-lg font-medium">
          {expanded ? "Hide" : "Read"} the Story
        </span>
        <ChevronDown className={cn("h-5 w-5 text-brand transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="p-6 grid gap-8 md:grid-cols-[1fr_280px]">
          <div className="prose prose-invert max-w-none">
            <p className="text-cream/80 leading-relaxed">
              {project.title} — a {project.categoryLabel.toLowerCase()} project
              {project.location ? ` shot in ${project.location}` : ""}
              {project.date ? ` on ${project.date}` : ""}.
              {isFilm && " Shot on 35mm film with a Pentax Espio 738, scanned on a NORITSU KOKI."}
              {cameras.length === 1 && !isFilm && ` Captured on ${cameras[0]}.`}
              {cameras.length > 1 && ` Captured on ${cameras.join(", ")}.`}
              {lenses.length && ` Lenses used: ${lenses.join(", ")}.`}
            </p>

            {focalLengths.length && (
              <p className="mt-4 text-sm text-muted">
                Focal lengths: {focalLengths.join(", ")}
              </p>
            )}
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-28 bg-surface/50 rounded-xl border border-line p-5">
              <h4 className="font-display text-sm font-medium mb-4 text-brand">Technical Specs</h4>
              <dl className="space-y-3 text-sm">
                {cameras.length && (
                  <div className="flex items-center gap-2 text-cream/80">
                    <Camera className="h-4 w-4 text-brand" />
                    <span>{cameras.join(", ")}</span>
                  </div>
                )}
                {lenses.length && (
                  <div className="flex items-center gap-2 text-cream/80">
                    <span className="text-brand">🔭</span>
                    <span>{lenses.join(", ")}</span>
                  </div>
                )}
                {focalLengths.length && (
                  <div className="flex items-center gap-2 text-cream/80">
                    <span className="text-brand">📏</span>
                    <span>{focalLengths.join(", ")}</span>
                  </div>
                )}
                {apertures.length && (
                  <div className="flex items-center gap-2 text-cream/80">
                    <Aperture className="h-4 w-4 text-brand" />
                    <span>{apertures.join(", ")}</span>
                  </div>
                )}
                {shutters.length && (
                  <div className="flex items-center gap-2 text-cream/80">
                    <Sun className="h-4 w-4 text-brand" />
                    <span>{shutters.join(", ")}</span>
                  </div>
                )}
                {isos.length && (
                  <div className="flex items-center gap-2 text-cream/80">
                    <Zap className="h-4 w-4 text-brand" />
                    <span>{isos.join(", ")}</span>
                  </div>
                )}
                {isFilm && (
                  <div className="flex items-center gap-2 text-cream/80 border-t border-line pt-3">
                    <span className="text-brand">🎞️</span>
                    <span>35mm Film · Scanned on NORITSU KOKI</span>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}