import type { Metadata } from "next";
import ImageGrid from "@/components/portfolio/image-grid";
import { getAllImages } from "@/lib/projects";
import SectionHeading from "@/components/shared/section-heading";

export const metadata: Metadata = {
  title: "Photos",
  description: "All photographs — a pure visual feed without categories or filters.",
};

export default function PhotosPage() {
  const images = getAllImages();

  return (
    <section className="min-h-screen pt-28 md:pt-36">
      <div className="container-site pb-20">
        <div className="mb-12 md:mb-16">
          <SectionHeading
            eyebrow="Photos"
            title="The Feed"
            description="Every frame in one place — just images, no filters, no noise."
          />
        </div>
        <ImageGrid
          items={images.map((img) => ({
            src: img.src ?? "",
            title: img.projectTitle,
            subtitle: img.camera,
            meta: [img.lens, img.aperture, img.shutterSpeed, img.iso].filter(Boolean).join(" · "),
          }))}
        />
      </div>
    </section>
  );
}