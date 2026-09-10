// Camera/location metadata overlays applied to manifest-backed galleries.
// Keys match image srcs after stripping the leading `/images/` and extension.
export const PROJECT_METADATA: Record<
  string,
  { location?: string; date?: string; instagram?: string }
> = {
  "portraits/the-quiet-hour/portrait-thequiethour-1": { location: "Tempe, AZ" },
  "side-projects/summer-picnic/miscellaneous-summerpicnic-1": { location: "Tempe, AZ" },
};

export const DEFAULT_CAMERA = "Sony a7 IV";

export interface ProjectOverlay {
  title?: string;
  description?: string;
  type?: string;
  ongoing?: boolean;
  date?: string;
  location?: string;
}

/**
 * Curated, project-level metadata for a category/project pair. Overrides the
 * auto-derived values from the image manifest (which only knows folder names).
 */
export const PROJECT_META: Record<string, ProjectOverlay> = {
  "side-projects/summer-picnic": {
    title: "Summer",
    description: "a collection of photographs from summer",
    type: "collection",
  },
  "side-projects/architecture": {
    title: "Architecture",
    description: "shapes, symmetry, and structure through the lens",
    type: "collection",
  },
  "side-projects/wallpapers": {
    title: "Wallpaper",
    description: "an ever-growing collection of photographs made to live beyond the portfolio",
    type: "ongoing-series",
    ongoing: true,
  },
};