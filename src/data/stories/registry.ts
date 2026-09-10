// Authoritative list of authored story pages. Kept stable and separate from
// scripts/parse-stories.mjs output so the site never depends on a regenerated
// index.json (which only reflects projects with RTF source files on disk).
export const STORY_REGISTRY: Record<string, { category: string; project: string }> = {
  "side-projects/summer-picnic": { category: "side-projects", project: "summer-picnic" },
  "portraits/eclectic-art": { category: "portraits", project: "eclectic-art" },
  "portraits/halloween-25": { category: "portraits", project: "halloween-25" },
  "portraits/nikon-tour": { category: "portraits", project: "nikon-tour" },
  "portraits/the-quiet-hour": { category: "portraits", project: "the-quiet-hour" },
};