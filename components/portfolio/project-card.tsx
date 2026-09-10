"use client";

import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.category}/${project.slug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface">
        {project.cover && (
          <Image
            src={project.cover}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        {project.ongoing && (
          <span className="absolute left-3 top-3 rounded-full border border-canvas/30 bg-canvas/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur-sm">
            Ongoing
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-medium group-hover:text-brand transition-colors">
            {project.title}
          </h3>
        </div>
        {project.description && (
          <p className="mt-1 max-w-sm text-sm text-muted">
            {project.description}
          </p>
        )}
        <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-muted">
          {project.imageCount} photos
          {project.location && ` · ${project.location}`}
          {project.date && ` · ${project.date}`}
        </p>
      </div>
    </Link>
  );
}