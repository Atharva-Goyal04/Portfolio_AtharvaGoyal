export const SITE = {
  name: "THE.LUMENCODE",
  domain: "atharvagoyal.com",
  author: "Atharva Goyal",
  tagline: "Photography",
  city: "Tempe, Arizona",
  email: "contact@atharvagoyal.com",
  description:
    "THE.LUMENCODE is the photography portfolio of Atharva Goyal — portraits, street scenes, and client sessions across Arizona, delivered as private online galleries.",
  ogImage: "/og.jpg",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://atharvagoyal.com"),
} as const;

export const EMAILS = {
  atharva: "atharva@atharvagoyal.com",
  contact: "contact@atharvagoyal.com",
  bookings: "bookings@atharvagoyal.com",
  photos: "photos@atharvagoyal.com",
  gallery: "gallery@atharvagoyal.com",
} as const;

export const ATHARVA_EMAIL = EMAILS.atharva;
export const CONTACT_EMAIL = EMAILS.contact;
export const BOOKINGS_EMAIL = EMAILS.bookings;
export const PHOTOS_EMAIL = EMAILS.photos;
export const GALLERY_EMAIL = EMAILS.gallery;

export const INSTAGRAM_URL = "https://www.instagram.com/the.lumencode/";
export const LINKEDIN_URL = "https://www.linkedin.com/in/atharva--goyal/";
export const FORMSPREE_ENDPOINT = "https://formspree.io/f/xjyvwgaw";
export const CALENDLY_URL = "https://calendly.com/projects-executable/photography-session";