import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import Photo from "@/components/shared/photo";
import { allProjects, neighbors } from "@/lib/projects";
import { monthYear, INSTAGRAM_URL } from "@/lib/utils";
import { imageInfo } from "@/lib/images";

interface ProjectDetailProps {
  params: Promise<{ category: string; name: string }>;
}

export function generateStaticParams() {
  return allProjects().map((p) => ({ category: p.folder, name: p.name }));
}

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { category, name } = await params;
  const project = allProjects().find((p) => p.folder === category && p.name === name);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: `${project.category} photography by Atharva Goyal${project.location ? ` — ${project.location}` : ""}.`,
    openGraph: { images: [imageInfo(project.image)?.url ?? project.image] },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { category, name } = await params;
  const projects = allProjects();
  const project = projects.find((p) => p.folder === category && p.name === name);
  if (!project) notFound();

  const { prev, next } = neighbors(projects, project);

  return (
    <section className="min-h-screen pt-28 pb-24">
      <div className="container-site max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand transition-colors hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" /> Portfolio
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-xl">
          <Photo
            src={project.image}
            alt={project.title}
            eager
            fit="contain"
            sizes="80vw"
            className="bg-surface"
            imgClassName="max-h-[78vh] mx-auto"
          />
        </div>

        <div className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow text-brand">{project.category}</span>
              {project.date && (
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  {monthYear(project.date)}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-4xl font-medium md:text-5xl">
              {project.title}
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted">
              {[project.location, project.camera].filter(Boolean).join(" · ")}
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-line px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:border-brand hover:text-brand"
            >
              <Instagram className="h-3.5 w-3.5" /> Instagram
            </a>
          </div>
        </div>

        <nav className="mt-14 flex items-center justify-between border-t border-line pt-8">
          {prev ? (
            <Link
              href={prev.path}
              className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-brand transition-colors hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Prev
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.path}
              className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-brand transition-colors hover:text-ink"
            >
              Next
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </section>
  );
}