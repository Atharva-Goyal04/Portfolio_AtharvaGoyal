import { imageCatalog } from "@/lib/images";
import type { Project } from "@/lib/types";
import type { ImageInfo } from "@/lib/types";
import { STORY_REGISTRY } from "@/src/data/stories/registry";
import { PROJECT_META } from "@/src/data/project-metadata";
import eclecticArt from "@/src/data/stories/portraits/eclectic-art.json";
import halloween25 from "@/src/data/stories/portraits/halloween-25.json";
import nikonTour from "@/src/data/stories/portraits/nikon-tour.json";
import theQuietHour from "@/src/data/stories/portraits/the-quiet-hour.json";
import summerPicnic from "@/src/data/stories/side-projects/summer-picnic.json";

export type { ImageInfo };

const STORY_KEYS = new Set(Object.keys(STORY_REGISTRY));

const COVERS_BY_PROJECT: Record<string, string> = {
  "portraits/eclectic-art": eclecticArt.coverImage,
  "portraits/halloween-25": halloween25.coverImage,
  "portraits/nikon-tour": nikonTour.coverImage,
  "portraits/the-quiet-hour": theQuietHour.coverImage,
  "side-projects/summer-picnic": summerPicnic.coverImage,
  "portraits/valentines-26-digital": "portrait-valentine_digital-5.jpg",
  "portraits/valentines-26-film": "portrait-valentine_filml-12.jpg",
  "street/vintage-car-meetup": "street-vintagecarmeetup-6.jpg",
};

/**
 * Curated ordering for category chips/filters across the site.
 * "featured" is a feed-only category (never a /projects card).
 */
export const CATEGORY_ORDER = ["featured", "portraits", "street", "side-projects"];

/** Categories that render as "Side Projects" (feed + projects page). */
export const SIDE_CATEGORIES = new Set(["side-projects"]);

/**
 * Website-only re-categorization. Internal storage (folders, manifest keys,
 * story files) stays untouched — only the displayed category/label changes.
 * Keyed by the internal `<category>/<project>` pair.
 */
const DISPLAY_CATEGORY: Record<string, { category: string; label: string }> = {
  "side-projects/summer-picnic": { category: "portraits", label: "Portraits" },
};

/** Display key (<displayCategory>/<slug>) -> internal key (<internalCategory>/<slug>). */
const DISPLAY_TO_INTERNAL: Record<string, string> = Object.fromEntries(
  Object.entries(DISPLAY_CATEGORY).map(([internal, { category }]) => [`${category}/${internal.split("/")[1]}`, internal]),
);

function displayCategoryFor(internalKey: string, fallbackCategory: string, fallbackLabel: string): { category: string; label: string } {
  return DISPLAY_CATEGORY[internalKey] ?? { category: fallbackCategory, label: fallbackLabel };
}

function internalKeyFor(displayKey: string): string {
  return DISPLAY_TO_INTERNAL[displayKey] ?? displayKey;
}

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
  const internal = internalKeyFor(`${categorySlug}/${projectSlug}`);
  const [internalCat, internalProj] = internal.split("/");
  return loadStory(internalCat, internalProj);
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
    const display = displayCategoryFor(key, catSlug, info.label);

    if (!projMap.has(key)) {
      projMap.set(key, {
        slug: projSlug,
        category: display.category,
        categoryLabel: display.label,
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

  for (const [key, proj] of projMap) {
    proj.images.sort((a, b) => (a.src ?? "").localeCompare(b.src ?? ""));
    if (!proj.cover && proj.images[0]) proj.cover = proj.images[0].url ?? "";

    const coverFile = COVERS_BY_PROJECT[key];
    if (coverFile) {
      const coverBase = coverFile.replace(/\.[^.]+$/, "").toLowerCase();
      const match = proj.images.find((img) => {
        const imgBase = (img.src ?? "").split("/").pop()?.replace(/\.[^.]+$/, "").toLowerCase();
        return imgBase === coverBase;
      });
      if (match) {
        proj.cover = match.url ?? "";
        proj.coverSrc = match.src ?? "";
      }
    }
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
    .map(([src, info]) => {
      const display = displayCategoryFor(`${info.category}/${info.project}`, info.category, info.label);
      return { ...info, src, category: display.category, label: display.label };
    })
    .sort((a, b) => (a.src ?? "").localeCompare(b.src ?? ""));
}

export function getImagesForProject(categorySlug: string, projectSlug: string): ImageInfo[] {
  const internal = internalKeyFor(`${categorySlug}/${projectSlug}`);
  const [internalCat, internalProj] = internal.split("/");
  return Object.entries(imageCatalog)
    .filter(([, info]) => info.category === internalCat && info.project === internalProj)
    .map(([src, info]) => ({ ...info, src }))
    .sort((a, b) => (a.src ?? "").localeCompare(b.src ?? ""));
}