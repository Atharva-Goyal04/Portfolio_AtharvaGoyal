import { cookies } from "next/headers";
import { createReadStream, existsSync } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { ZipArchive } from "archiver";
import { galleryBySlug, isExpired } from "@/lib/gallery";
import { galleryUnlocked } from "@/lib/gallery-auth";
import { presignGet, r2Config, r2KeysFromSource } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const gallery = await galleryBySlug(slug);
  if (!gallery) return new Response("Gallery not found", { status: 404 });
  if (!gallery.download) return new Response("Downloads are disabled for this gallery", { status: 403 });
  if (isExpired(gallery)) return new Response("This gallery has expired", { status: 403 });

  const store = await cookies();
  if (!galleryUnlocked(store, gallery)) {
    return new Response("Gallery is locked", { status: 403 });
  }

  const cfg = r2Config();
  const archive = new ZipArchive({ zlib: { level: 6 } });

  for (const source of gallery.images) {
    const keys = r2KeysFromSource(source);
    if (keys && cfg) {
      const signed = await presignGet(cfg, keys.original, 60);
      const res = await fetch(signed);
      if (res.ok && res.body) {
        archive.append(Readable.fromWeb(res.body as import("node:stream/web").ReadableStream), {
          name: keys.original.split("/").pop() ?? "photo.jpg",
        });
      }
    } else {
      const filePath = path.join(process.cwd(), "public", source.replace(/^\//, ""));
      if (existsSync(filePath)) {
        archive.append(createReadStream(filePath), { name: path.basename(source) });
      }
    }
  }

  archive.on("warning", (err: unknown) => {
    const code = typeof err === "object" && err !== null ? (err as { code?: string }).code : undefined;
    if (code !== "ENOENT") console.warn("zip warning:", err);
  });
  archive.on("error", (err: unknown) => {
    console.warn("zip error:", err);
  });

  await archive.finalize();

  return new Response(Readable.toWeb(archive) as ReadableStream<Uint8Array>, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${gallery.slug}-photos.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}