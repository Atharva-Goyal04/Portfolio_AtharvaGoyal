export const SITE = {
  name: "THE.LUMENCODE",
  domain: "the-lumencode.vercel.app",
  author: "Atharva Goyal",
  tagline: "Photography",
  city: "Tempe, Arizona",
  email: "the.lumencode@gmail.com",
  description:
    "THE.LUMENCODE is the photography portfolio of Atharva Goyal — portraits, street scenes, and client sessions across Arizona, delivered as private online galleries.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://the-lumencode.vercel.app"),
} as const;

export const INSTAGRAM_URL = "https://www.instagram.com/the.lumencode/";
export const INSTAGRAM_PERSONAL = "https://www.instagram.com/atharva__goyal/";
export const LINKEDIN_URL = "https://www.linkedin.com/in/atharva--goyal/";
export const CONTACT_EMAIL = SITE.email;
export const FORMSPREE_ENDPOINT = "https://formspree.io/f/xjyvwgaw";