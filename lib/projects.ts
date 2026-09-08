import { imageCatalog } from "@/lib/images";
import { titleFromName } from "@/lib/utils";
import type { Project } from "@/lib/types";
import { CATEGORY_META, DEFAULT_CAMERA, PROJECT_METADATA } from "@/src/data/project-metadata";

export function allProjects(): Project[] {
  const favoriteNames = new Set<string>();
  for (const src of Object.keys(imageCatalog)) {
    const fav = src.match(/^\/images\/favorite\/([^/]+)\.\w+$/);
    if (fav) favoriteNames.add(fav[1]);
  }

  const byName = new Map<string, Project>();
  for (const [src, info] of Object.entries(imageCatalog)) {
    const match = src.match(/^\/images\/([^/]+)\/([^/]+)\.\w+$/);
    if (!match) continue;
    const folder = match[1];
    if (folder === "favorite") continue;
    const name = match[2];
    const category = CATEGORY_META[folder]?.label ?? titleFromName(folder);
    const meta =
      PROJECT_METADATA[`${folder}/${name}`] ??
      PROJECT_METADATA[`favorite/${name}`] ??
      {};
    const project: Project = {
      folder,
      category,
      name,
      image: src,
      path: `/projects/${folder}/${name}`,
      title: titleFromName(name),
      width: info.width,
      height: info.height,
      camera: DEFAULT_CAMERA,
      location: meta.location ?? "",
      date: meta.date ?? "",
      featured: favoriteNames.has(name),
    };
    const current = byName.get(name);
    if (!current) {
      byName.set(name, project);
    }
  }
  return [...byName.values()].sort(
    (a, b) => a.folder.localeCompare(b.folder) || a.name.localeCompare(b.name),
  );
}

export function neighbors(list: Project[], project: Project): { prev: Project | null; next: Project | null } {
  const same = list.filter((p) => p.folder === project.folder);
  const idx = same.findIndex((p) => p.name === project.name);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: same[(idx - 1 + same.length) % same.length],
    next: same[(idx + 1) % same.length],
  };
}