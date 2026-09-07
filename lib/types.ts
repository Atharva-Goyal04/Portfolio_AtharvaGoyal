export interface ImageInfo {
  category: string;
  label: string;
  width: number;
  height: number;
  blur?: string;
  url?: string;
}

export type ImageCatalog = Record<string, ImageInfo>;

export interface Project {
  folder: string;
  category: string;
  name: string;
  image: string;
  path: string;
  title: string;
  width: number;
  height: number;
  camera?: string;
  location?: string;
  date?: string;
  featured?: boolean;
}

export type GalleryCategory =
  | "graduation"
  | "portrait"
  | "couples"
  | "events"
  | "travel"
  | "street";

export interface Gallery {
  title: string;
  slug: string;
  cover: string;
  description?: string;
  password?: string;
  download: boolean;
  featured: boolean;
  expires?: string;
  location?: string;
  date?: string;
  category: GalleryCategory;
  images: string[];
}

export interface GalleryImage extends ImageInfo {
  src: string;
  title: string;
  width: number;
  height: number;
  meta?: string;
}