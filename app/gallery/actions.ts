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

  const gallery = await galleryBySlug(slug);
  if (!gallery?.password) {
    return { error: "This gallery is not configured for password access." };
  }

  if (!password || password !== gallery.password) {
    return { error: "That password didn't work. Please try again." };
  }

  const store = await cookies();
  store.set(galleryCookieName(slug), issueToken(slug), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  revalidatePath(`/gallery/${slug}`);
  return { success: true };
}