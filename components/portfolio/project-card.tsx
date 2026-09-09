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
      </div>
      <div className="mt-4">
        <h3 className="font-display text-lg font-medium group-hover:text-brand transition-colors">
          {project.title}
        </h3>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted">
          {project.imageCount} photos
          {project.location && ` · ${project.location}`}
          {project.date && ` · ${project.date}`}
        </p>
      </div>
    </Link>
  );
}