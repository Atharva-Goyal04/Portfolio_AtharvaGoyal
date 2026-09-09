import { imageCatalog } from "@/lib/images";
import type { Project } from "@/lib/types";
import type { ImageInfo } from "@/lib/types";

export type { ImageInfo };

export interface StoryChapter {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  description: string;
  images: StoryImage[];
}

export interface StoryImage {
  file: string;
  editorialTitle: string;
  description: string;
  role: string;
  featured?: boolean;
  favorite?: boolean;
  alsoInWallpapers?: boolean;
  note?: string;
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
    const projSlug = info.project;
    const key = `${catSlug}/${projSlug}`;

    if (!projMap.has(key)) {
      projMap.set(key, {
        slug: projSlug,
        category: catSlug,
        categoryLabel: info.label,
        title: info.projectTitle,
        cover: info.url ?? "",
        coverSrc: src,
        imageCount: 0,
        date: undefined,
        location: undefined,
        camera: undefined,
        hasStory: false,
        storyPath: undefined,
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
    const catOrder = a.categoryLabel.localeCompare(b.categoryLabel);
    if (catOrder !== 0) return catOrder;
    return a.title.localeCompare(b.title);
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
  return Object.values(imageCatalog)
    .map((info) => ({ ...info, src: info.src ?? "" }))
    .sort((a, b) => (a.src ?? "").localeCompare(b.src ?? ""));
}

export function getImagesForProject(categorySlug: string, projectSlug: string): ImageInfo[] {
  return Object.values(imageCatalog)
    .filter((i) => i.category === categorySlug && i.project === projectSlug)
    .map((info) => ({ ...info, src: info.src ?? "" }))
    .sort((a, b) => (a.src ?? "").localeCompare(b.src ?? ""));
}