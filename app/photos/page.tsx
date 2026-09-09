import type { Metadata } from "next";
import PhotosFeed from "@/components/portfolio/photos-feed";
import { getAllImages } from "@/lib/projects";
import type { ImageInfo } from "@/lib/types";

export const metadata: Metadata = {
  title: "Photos",
  description: "All photographs — filter by category or project, or just browse the feed.",
};

export default function PhotosPage() {
  const images = getAllImages().filter((img): img is ImageInfo & { src: string } => Boolean(img.src));

  return <PhotosFeed initialImages={images} />;
}