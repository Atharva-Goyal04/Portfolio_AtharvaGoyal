import type { Metadata } from "next";
import SectionHeading from "@/components/shared/section-heading";
import ProjectsBrowse from "@/components/portfolio/projects-browse";
import { allProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Photography projects by Atharva Goyal — organized by shoot, with stories and technical details.",
};

export default function ProjectsPage() {
  const projects = allProjects();

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
        <ProjectsBrowse projects={projects} />
      </div>
    </section>
  );
}