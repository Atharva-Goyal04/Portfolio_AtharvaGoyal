// Camera/location metadata migrated from the Vite-era Google Sheet import.
export const PROJECT_METADATA: Record<
  string,
  { location?: string; date?: string; instagram?: string }
> = {
  "favorite/AG_04225": { location: "Tempe, AZ", date: "2024-05" },
};

export const DEFAULT_CAMERA = "Sony a7 IV";

export const CATEGORY_META: Record<
  string,
  { label: string; description: string }
> = {
  street: {
    label: "Street",
    description: "Candid frames from Arizona sidewalks and city edges.",
  },
  portrait: {
    label: "Portraits",
    description: "People, personality, and the quiet in-between moments.",
  },
  architecture: {
    label: "Architecture",
    description: "Lines, light, and geometry in the built world.",
  },
  film: {
    label: "Film",
    description: "35mm experiments in color and grain.",
  },
  favorite: {
    label: "Featured",
    description: "A hand-picked selection of signature frames.",
  },
  "summer-picnic": {
    label: "Summer Picnic",
    description: "Golden-hour friends, food, and late Arizona sun.",
  },
};