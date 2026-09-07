import { cookies } from "next/headers";
import { galleryBySlug, isExpired } from "@/lib/gallery";
import { galleryUnlocked } from "@/lib/gallery-auth";
import { presignGet, r2Config, r2KeysFromSource } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const gallery = await galleryBySlug(slug);
  if (!gallery) return Response.json({ error: "Gallery not found" }, { status: 404 });
  if (isExpired(gallery)) return Response.json({ error: "This gallery has expired" }, { status: 403 });

  const store = await cookies();
  if (!galleryUnlocked(store, gallery)) {
    return Response.json({ error: "Gallery is locked" }, { status: 403 });
  }

  const cfg = r2Config();
  if (!cfg) return Response.json({ error: "R2 is not configured" }, { status: 500 });

  const images = [];
  for (const source of gallery.images) {
    const keys = r2KeysFromSource(source);
    if (!keys) continue;
    images.push({
      src: source,
      name: keys.original.split("/").pop(),
      url: await presignGet(cfg, keys.preview, 900),
    });
  }

  return Response.json({ images, expiresIn: 840 }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}