export interface ImageInfo {
  src?: string;
  category: string;
  label: string;
  project: string;
  projectTitle: string;
  width: number;
  height: number;
  blur?: string;
  url?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  isFilm?: boolean;
}

export type ImageCatalog = Record<string, ImageInfo>;

export interface Project {
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  cover: string;
  coverSrc: string;
  imageCount: number;
  date?: string;
  location?: string;
  camera?: string;
  hasStory: boolean;
  storyPath?: string;
  images: ImageInfo[];
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

export interface GalleryImage {
  src: string;
  title: string;
  width: number;
  height: number;
  meta?: string;
  category: string;
  label: string;
  project: string;
  projectTitle: string;
  blur?: string;
  url?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  isFilm?: boolean;
}