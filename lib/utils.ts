import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function monthYear(date?: string): string {
  if (!date) return "";
  const m = String(date).match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (!m) return String(date);
  const year = m[1];
  const month = m[2]
    ? new Date(Number(year), Number(m[2]) - 1, 1).toLocaleString("en-US", {
        month: "long",
      })
    : "";
  return month ? `${month} ${year}` : year;
}

export function titleFromName(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\.edit$/i, "")
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export {
  CONTACT_EMAIL,
  FORMSPREE_ENDPOINT,
  INSTAGRAM_PERSONAL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  SITE,
  WEB3_URL,
} from "@/lib/site";