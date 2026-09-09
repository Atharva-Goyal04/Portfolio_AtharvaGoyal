// Camera/location metadata overlays applied to manifest-backed galleries.
// Keys match image srcs after stripping the leading `/images/` and extension.
export const PROJECT_METADATA: Record<
  string,
  { location?: string; date?: string; instagram?: string }
> = {
  "portraits/the-quiet-hour/portrait-thequiethour-1": { location: "Tempe, AZ" },
  "miscellaneous-projects/summer-picnic/miscellaneous-summerpicnic-1": { location: "Tempe, AZ" },
};

export const DEFAULT_CAMERA = "Sony a7 IV";