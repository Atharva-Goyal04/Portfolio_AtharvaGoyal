import { imageCatalog } from "@/lib/images";
import type { Project } from "@/lib/types";
import type { ImageInfo } from "@/lib/types";
import { STORY_REGISTRY } from "@/src/data/stories/registry";
import { PROJECT_META } from "@/src/data/project-metadata";

export type { ImageInfo };

const STORY_KEYS = new Set(Object.keys(STORY_REGISTRY));

/**
 * Curated ordering for category chips/filters across the site.
 * "featured" is a feed-only category (never a /projects card).
 */
export const CATEGORY_ORDER = ["featured", "portraits", "street", "architecture", "side-projects"];

/** Categories that render as "Side Projects" (feed + projects page). */
export const SIDE_CATEGORIES = new Set(["side-projects"]);

export interface StoryChapter {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  description: string;
  images: StoryImage[];
  story?: string;
}

export type EditorialLayout = "full" | "large" | "medium" | "two-up" | "offset" | "detail";

export interface StoryImage {
  file: string;
  editorialTitle: string;
  description: string;
  role: string;
  layout?: EditorialLayout;
  featured?: boolean;
  favorite?: boolean;
  alsoInWallpapers?: boolean;
  note?: string;
  storyConnection?: string;
}

export interface StoryRelated {
  file: string;
  title: string;
  description?: string;
  storyConnection?: string;
}

/** A paragraph of the photographer's own narrative, optionally pinned to an image. */
export interface StorySection {
  text: string;
  /** File (with or without extension) referenced near this section. */
  image?: string;
  related?: StoryRelated[];
}

export interface ProjectStory {
  projectTitle: string;
  projectType: string;
  location: string;
  time: string;
  camera: string;
  cameraNote?: string;
  lens?: string;
  flash?: string;
  tagline?: string;
  introduction?: string;
  lightingSetup?: Array<{ role: string; detail: string }>;
  coverImage: string;
  visualChapters: StoryChapter[];
  favoriteImages?: Array<{
    file: string;
    editorialTitle: string;
    description: string;
    role: string;
    note?: string;
  }>;
  closingStory: string;
  instagramRefs?: Array<{ title: string; url: string }>;
  websitePresentation: string;
  outfits?: Record<string, string[]>;
  creativeThemes: string[];
  editing?: {
    software: string;
    inspiration: string;
    style: string;
  };
  sections?: StorySection[];
  editingStory?: string;
  conclusion?: string;
}

async function loadStory(categorySlug: string, projectSlug: string): Promise<ProjectStory | null> {
  try {
    const mod = await import(`@/src/data/stories/${categorySlug}/${projectSlug}.json`);
    return mod.default;
  } catch {
    return null;
  }
}

export async function getProjectStory(categorySlug: string, projectSlug: string): Promise<ProjectStory | null> {
  return loadStory(categorySlug, projectSlug);
}

export function allCategories(): { slug: string; label: string; projectCount: number }[] {
  const catMap = new Map<string, { label: string; projects: Set<string> }>();

  for (const [, info] of Object.entries(imageCatalog)) {
    const cat = info.category;
    const proj = info.project;
    if (!catMap.has(cat)) catMap.set(cat, { label: info.label, projects: new Set() });
    catMap.get(cat)!.projects.add(proj);
  }

  return [...catMap.entries()]
    .map(([slug, { label, projects }]) => ({ slug, label, projectCount: projects.size }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function allProjects(): Project[] {
  const projMap = new Map<string, Project>();

  for (const [src, info] of Object.entries(imageCatalog)) {
    const catSlug = info.category;
    if (catSlug === "featured") continue; // feed-only category, not a shoot
    const projSlug = info.project;
    const key = `${catSlug}/${projSlug}`;
    const hasStory = STORY_KEYS.has(key);
    const overlay = PROJECT_META[key];

    if (!projMap.has(key)) {
      projMap.set(key, {
        slug: projSlug,
        category: catSlug,
        categoryLabel: info.label,
        title: overlay?.title ?? info.projectTitle,
        description: overlay?.description,
        type: overlay?.type,
        ongoing: overlay?.ongoing,
        date: overlay?.date,
        location: overlay?.location,
        cover: info.url ?? "",
        coverSrc: src,
        imageCount: 0,
        camera: undefined,
        hasStory,
        storyPath: hasStory ? `../../src/data/stories/${catSlug}/${projSlug}.json` : undefined,
        images: [],
      });
    }

    const proj = projMap.get(key)!;
    proj.images.push({ ...info, src });
    proj.imageCount++;

    if (info.camera && !proj.camera) proj.camera = info.camera;
  }

  for (const proj of projMap.values()) {
    proj.images.sort((a, b) => (a.src ?? "").localeCompare(b.src ?? ""));
    if (!proj.cover && proj.images[0]) proj.cover = proj.images[0].url ?? "";
  }

  return [...projMap.values()].sort((a, b) => {
    const aCat = CATEGORY_ORDER.indexOf(a.category);
    const bCat = CATEGORY_ORDER.indexOf(b.category);
    return (aCat === -1 ? CATEGORY_ORDER.length : aCat) - (bCat === -1 ? CATEGORY_ORDER.length : bCat) ||
      a.title.localeCompare(b.title);
  });
}

export function getProjectsByCategory(categorySlug: string): Project[] {
  return allProjects().filter((p) => p.category === categorySlug);
}

export function getProject(categorySlug: string, projectSlug: string): Project | undefined {
  return allProjects().find((p) => p.category === categorySlug && p.slug === projectSlug);
}

export async function getProjectWithStory(categorySlug: string, projectSlug: string): Promise<{ project: Project; story: ProjectStory | null } | null> {
  const project = getProject(categorySlug, projectSlug);
  if (!project) return null;
  
  const story = await getProjectStory(categorySlug, projectSlug);
  return { project, story };
}

export function getAllImages(): ImageInfo[] {
  return Object.entries(imageCatalog)
    .map(([src, info]) => ({ ...info, src }))
    .sort((a, b) => (a.src ?? "").localeCompare(b.src ?? ""));
}

export function getImagesForProject(categorySlug: string, projectSlug: string): ImageInfo[] {
  return Object.entries(imageCatalog)
    .filter(([, info]) => info.category === categorySlug && info.project === projectSlug)
    .map(([src, info]) => ({ ...info, src }))
    .sort((a, b) => (a.src ?? "").localeCompare(b.src ?? ""));
}