import catalog from "@/src/data/image-manifest.json";
import type { ImageCatalog, ImageInfo } from "@/lib/types";

const manifest = catalog as ImageCatalog;

export function imageInfo(src: string): ImageInfo | undefined {
  return manifest[src];
}

export { manifest as imageCatalog };