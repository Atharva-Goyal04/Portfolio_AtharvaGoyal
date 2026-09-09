import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProject, getImagesForProject, allProjects, getProjectWithStory, type ImageInfo } from "@/lib/projects";
import Photo from "@/components/shared/photo";
import ImageGrid from "@/components/portfolio/image-grid";
import ProjectStory from "@/components/portfolio/project-story";

interface ProjectDetailProps {
  params: Promise<{ category: string; project: string }>;
}

export function generateStaticParams() {
  return allProjects().map((p) => ({ category: p.category, project: p.slug }));
}

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { category, project } = await params;
  const proj = getProject(category, project);
  if (!proj) return { title: "Project not found" };
  return {
    title: proj.title,
    description: `${proj.categoryLabel} photography by Atharva Goyal${proj.location ? ` — ${proj.location}` : ""}.`,
    openGraph: { images: [proj.cover] },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { category, project } = await params;
  const result = await getProjectWithStory(category, project);
  if (!result) notFound();
  const { project: proj, story } = result;

  const images = getImagesForProject(category, project).filter((img): img is ImageInfo & { src: string } => Boolean(img.src));

  return (
    <section className="min-h-screen pt-28 pb-24">
      <div className="container-site max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand transition-colors hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" /> Projects
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-xl mb-10">
          <Photo
            src={proj.cover}
            alt={proj.title}
            eager
            fit="contain"
            sizes="80vw"
            className="bg-surface"
            imgClassName="max-h-[78vh] mx-auto"
          />
        </div>

        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow text-brand">{proj.categoryLabel}</span>
              {proj.date && (
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  {proj.date}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-4xl font-medium md:text-5xl">
              {proj.title}
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted">
              {[proj.location, proj.camera].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        {story && (
          <ProjectStory story={story} images={images as unknown as { src: string; [key: string]: unknown }[]} />
        )}

        <div className="mt-10">
          <ImageGrid
            items={images.map((img) => ({
              src: img.src ?? "",
              title: img.projectTitle,
              subtitle: img.camera,
              meta: [img.lens, img.aperture, img.shutterSpeed, img.iso].filter(Boolean).join(" · "),
            }))}
          />
        </div>
      </div>
    </section>
  );
}