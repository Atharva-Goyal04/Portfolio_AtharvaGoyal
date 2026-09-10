// Authoritative list of authored story pages. Kept stable and separate from
// scripts/parse-stories.mjs output so the site never depends on a regenerated
// index.json (which only reflects projects with RTF source files on disk).
export const STORY_REGISTRY: Record<string, { category: string; project: string }> = {
  "architecture/architecture": { category: "architecture", project: "architecture" },
  "side-projects/summer-picnic": { category: "side-projects", project: "summer-picnic" },
  "side-projects/wallpapers": { category: "side-projects", project: "wallpapers" },
  "portraits/eclectic-art": { category: "portraits", project: "eclectic-art" },
  "portraits/halloween-25": { category: "portraits", project: "halloween-25" },
  "portraits/nikon-tour": { category: "portraits", project: "nikon-tour" },
  "portraits/the-quiet-hour": { category: "portraits", project: "the-quiet-hour" },
  "street/color-hunt-green": { category: "street", project: "color-hunt-green" },
  "street/vintage-car-meetup": { category: "street", project: "vintage-car-meetup" },
};