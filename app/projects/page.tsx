import type { Metadata } from "next";
import SectionHeading from "@/components/shared/section-heading";
import ProjectsGallery from "@/components/portfolio/projects-gallery";
import { allProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "The photography portfolio of Atharva Goyal — street, portraits, architecture, film, and more, all in one place.",
};

export default function ProjectsPage() {
  const projects = allProjects();

  return (
    <section className="min-h-screen pt-28 md:pt-36">
      <div className="container-site pb-20">
        <div className="mb-12 md:mb-16">
          <SectionHeading
            eyebrow="Portfolio"
            title="The Frames"
            description="Every frame in one place — filter by category, open, and roam through the archive."
          />
        </div>
        <ProjectsGallery projects={projects} />
      </div>
    </section>
  );
}