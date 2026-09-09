import type { MetadataRoute } from "next";
import { allProjects } from "@/lib/projects";
import { galleries } from "@/lib/gallery";
import { allJournalEntries } from "@/src/data/journal";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/projects", "/journal", "/gallery", "/about", "/contact"].map(
    (path) => ({ url: `${base}${path}`, lastModified }),
  );

  const journalRoutes: MetadataRoute.Sitemap = allJournalEntries().map((e) => ({
    url: `${base}/journal/${e.slug}`,
    lastModified,
  }));

  const projectRoutes: MetadataRoute.Sitemap = allProjects().map((p) => ({
    url: `${base}/projects/${p.category}/${p.slug}`,
    lastModified,
  }));

  const galleryRoutes: MetadataRoute.Sitemap = (await galleries()).map((g) => ({
    url: `${base}/gallery/${g.slug}`,
    lastModified,
  }));

  return [...staticRoutes, ...journalRoutes, ...galleryRoutes, ...projectRoutes];
}