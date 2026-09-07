import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Gallery, GalleryImage } from "@/lib/types";
import { imageInfo } from "@/lib/images";
import { monthYear, titleFromName } from "@/lib/utils";
import { DEFAULT_CAMERA, PROJECT_METADATA } from "@/src/data/project-metadata";

export const GALLERIES_DIR = path.join(process.cwd(), "content", "galleries");

export async function rawGalleries(): Promise<Gallery[]> {
  const entries = await readdir(GALLERIES_DIR, { withFileTypes: true });
  const galleries: Gallery[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = path.join(GALLERIES_DIR, entry.name, "gallery.json");
    try {
      const parsed = JSON.parse(await readFile(file, "utf8")) as Gallery;
      if (parsed.slug) galleries.push(parsed);
    } catch {
      // skip malformed gallery folders
    }
  }
  return galleries.sort(
    (a, b) => (b.date ?? "").localeCompare(a.date ?? ""),
  );
}

export function resolveGalleryImages(gallery: Gallery): GalleryImage[] {
  const out: GalleryImage[] = [];
  for (const src of gallery.images) {
    const info = imageInfo(src);
    if (!info) continue;
    const key = src.replace(/^\/images\//, "").replace(/\.[a-z0-9]+$/i, "");
    const md = PROJECT_METADATA[key];
    const meta = [md?.location, md?.date && monthYear(md.date), DEFAULT_CAMERA]
      .filter(Boolean)
      .join(" · ");
    out.push({
      src,
      title: titleFromName(src.split("/").pop() ?? ""),
      category: info.category,
      label: info.label,
      width: info.width,
      height: info.height,
      blur: info.blur,
      meta: meta || undefined,
    });
  }
  return out;
}

export async function galleryBySlug(slug: string): Promise<Gallery | null> {
  const galleries = await rawGalleries();
  return galleries.find((g) => g.slug === slug) ?? null;
}

export async function galleries(): Promise<Gallery[]> {
  return rawGalleries();
}

export async function featuredGalleries(): Promise<Gallery[]> {
  return (await rawGalleries()).filter((g) => g.featured);
}

export function isExpired(gallery: Gallery): boolean {
  if (!gallery.expires) return false;
  return new Date(gallery.expires) < new Date();
}