import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { Gallery } from "@/lib/types";

export const galleryCookieName = (slug: string) => `gallery-${slug}`;

interface CookieReader {
  get(name: string): { value?: string } | undefined;
}

function secret() {
  return process.env.GALLERY_SECRET ?? "lumencode-dev-secret-change-in-production";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function isValidToken(token: string | undefined, slug: string): boolean {
  if (!token) return false;
  const [value, sig] = token.split(".");
  if (value !== slug) return false;
  const expected = sign(slug);
  const a = Buffer.from(sig ?? "");
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function issueToken(slug: string): string {
  return `${slug}.${sign(slug)}`;
}

export function galleryUnlocked(
  cookieStore: CookieReader,
  gallery: Pick<Gallery, "slug" | "password">,
): boolean {
  if (!gallery.password) return false;
  const token = cookieStore.get(galleryCookieName(gallery.slug))?.value;
  return isValidToken(token, gallery.slug);
}