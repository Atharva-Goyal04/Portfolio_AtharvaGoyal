import catalog from "@/src/data/image-manifest.json";
import type { ImageCatalog, ImageInfo } from "@/lib/types";

const manifest = catalog as unknown as ImageCatalog;

export function imageInfo(src: string): ImageInfo | undefined {
  const info = manifest[src];
  if (info) return { ...info, src };
  return undefined;
}

export { manifest as imageCatalog };