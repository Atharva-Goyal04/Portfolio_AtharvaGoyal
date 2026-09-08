"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { galleryBySlug } from "@/lib/gallery";
import { galleryCookieName, issueToken } from "@/lib/gallery-auth";

export interface UnlockState {
  error?: string;
  success?: boolean;
}

export async function unlockGallery(
  _prev: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const slug = String(formData.get("slug") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  const gallery = await galleryBySlug(slug);
  if (!gallery?.password) {
    return { error: "This gallery is not configured for password access." };
  }

  if (!password || password !== gallery.password) {
    return { error: "That password didn't work. Please try again." };
  }

  const store = await cookies();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 7 } : {}),
  };
  store.set(galleryCookieName(slug), issueToken(slug), cookieOptions);

  revalidatePath(`/gallery/${slug}`);
  return { success: true };
}