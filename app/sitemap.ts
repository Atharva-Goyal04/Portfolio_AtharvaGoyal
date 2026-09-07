import type { MetadataRoute } from "next";
import { allProjects } from "@/lib/projects";
import { galleries } from "@/lib/gallery";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/projects", "/photography", "/gallery", "/about", "/contact"].map(
    (path) => ({ url: `${base}${path}`, lastModified }),
  );

  const projectRoutes: MetadataRoute.Sitemap = allProjects().map((p) => ({
    url: `${base}${p.path}`,
    lastModified,
  }));

  const galleryRoutes: MetadataRoute.Sitemap = (await galleries()).map((g) => ({
    url: `${base}/gallery/${g.slug}`,
    lastModified,
  }));

  return [...staticRoutes, ...galleryRoutes, ...projectRoutes];
}