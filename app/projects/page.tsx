import type { Metadata } from "next";
import SectionHeading from "@/components/shared/section-heading";
import ProjectsBrowse from "@/components/portfolio/projects-browse";
import ProjectCard from "@/components/portfolio/project-card";
import { allProjects, SIDE_CATEGORIES } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Photography projects by Atharva Goyal — organized by shoot, with stories and technical details.",
};

export default function ProjectsPage() {
  const projects = [...allProjects()].sort(
    (a, b) =>
      Number(b.hasStory) - Number(a.hasStory) ||
      a.categoryLabel.localeCompare(b.categoryLabel) ||
      a.title.localeCompare(b.title),
  );

  const main = projects.filter((p) => !SIDE_CATEGORIES.has(p.category));
  const side = projects.filter((p) => SIDE_CATEGORIES.has(p.category));

  return (
    <section className="min-h-screen pt-28 md:pt-36">
      <div className="container-site pb-20">
        <div className="mb-12 md:mb-16">
          <SectionHeading
            eyebrow="Projects"
            title="The Shoots"
            description="Each project is a shooting session — portraits, street, film, architecture. Click to explore the story and images."
          />
        </div>
        <ProjectsBrowse projects={main} />

        {side.length > 0 && (
          <div className="mt-24 md:mt-32">
            <div className="mb-8 border-t border-line pt-12 md:pt-16">
              <SectionHeading
                eyebrow="Side Projects"
                title="Photography that doesn't"
                highlight="need a category"
                description="Some are collections from a particular time. Some are ongoing experiments. Some are simply photographs I wanted to keep together."
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {side.map((p) => (
                <ProjectCard key={`${p.category}/${p.slug}`} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}