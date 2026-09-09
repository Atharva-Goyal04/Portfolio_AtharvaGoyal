import { cookies } from "next/headers";
import { galleryBySlug, isExpired } from "@/lib/gallery";
import { galleryUnlocked } from "@/lib/gallery-auth";
import { presignGet, r2Config, r2KeysFromSource } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; name: string }> },
) {
  const { slug, name } = await params;

  const gallery = await galleryBySlug(slug);
  if (!gallery) return new Response("Gallery not found", { status: 404 });
  if (!gallery.download) return new Response("Downloads are disabled for this gallery", { status: 403 });
  if (isExpired(gallery)) return new Response("This gallery has expired", { status: 403 });

  const store = await cookies();
  if (!galleryUnlocked(store, gallery)) {
    return new Response("Gallery is locked", { status: 403 });
  }

  const cfg = r2Config();
  if (!cfg) return new Response("R2 is not configured", { status: 500 });

  const source = gallery.images.find((img) => {
    const keys = r2KeysFromSource(img);
    return keys && keys.original.split("/").pop() === name;
  });

  if (!source) return new Response("Image not found", { status: 404 });

  const keys = r2KeysFromSource(source);
  if (!keys) return new Response("Image not found", { status: 404 });

  const signed = await presignGet(cfg, keys.original, 60);
  const res = await fetch(signed);

  if (!res.ok || !res.body) {
    return new Response("Failed to fetch image", { status: 500 });
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  });
}