import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  r2OriginalKey,
  r2PreviewKey,
  signedPutHeaders,
} from "../lib/r2-sign.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const envPath = path.join(ROOT, ".env.local");
try {
  const raw = await readFile(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // env vars may already be exported
}

const cfg = {
  accountId: process.env.R2_ACCOUNT_ID ?? "",
  accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  bucket: process.env.R2_BUCKET ?? "",
};
if (!cfg.accountId || !cfg.accessKeyId || !cfg.secretAccessKey || !cfg.bucket) {
  console.error("[r2] R2 credentials are incomplete in .env.local");
  process.exit(1);
}

const usage = `Usage: node scripts/r2-upload.mjs <slug> [sourceDir]
  Uploads full-res originals + webp previews of every image in sourceDir to
  Cloudflare R2 as gallery/<slug>/<file>, then writes
  content/galleries/<slug>/gallery.json with an auto-generated
  branded password (LUMEN-<hex>) and a cover pointing at the first upload.

  Re-running for an existing gallery keeps its current password and settings.`;

const slug = process.argv[2];
const sourceDir = process.argv[3] ?? path.join(ROOT, "deliverables", slug);
if (!slug || !fs.existsSync(sourceDir)) {
  console.error(usage);
  process.exit(1);
}

const generatePassword = () =>
  `LUMEN-${randomBytes(5).toString("hex").toUpperCase()}`;

const mime = (f) => {
  const ext = path.extname(f).toLowerCase();
  return ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".heic" ? "image/heic" : "image/jpeg";
};

async function put(key, body, contentType) {
  const headers = await signedPutHeaders(cfg, key, body, contentType);
  const path = key.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${path}`, {
    method: "PUT",
    headers,
    body,
  });
  if (!res.ok) throw new Error(`PUT ${key} -> ${res.status} ${await res.text().catch(() => "")}`);
}

async function main() {
  const files = (await readdir(sourceDir))
    .filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f) && !f.startsWith("."))
    .sort();

  if (!files.length) {
    console.error(`[r2] no image files in ${sourceDir}`);
    process.exit(1);
  }

  const manifest = [];
  for (const file of files) {
    const originalKey = r2OriginalKey(slug, file);
    const previewKey = r2PreviewKey(slug, file);
    const body = await readFile(path.join(sourceDir, file));
    await put(originalKey, body, mime(file));
    const preview = await sharp(body).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    await put(previewKey, preview, "image/webp");
    manifest.push({ name: file, src: `r2:${originalKey}` });
    console.log(`  ${file} -> ${originalKey}`);
  }

  const outDir = path.join(ROOT, "content", "galleries", slug);
  await mkdir(outDir, { recursive: true });

  let existing = {};
  try {
    existing = JSON.parse(await readFile(path.join(outDir, "gallery.json"), "utf8"));
  } catch {
    // first upload for this gallery
  }

  const password = existing.password || generatePassword();
  const gallery = {
    title: existing.title ?? slug,
    slug,
    cover: manifest[0].src,
    description: existing.description,
    password,
    download: existing.download ?? false,
    featured: existing.featured ?? false,
    category: existing.category ?? "portrait",
    location: existing.location,
    date: existing.date,
    expires: existing.expires,
    images: manifest.map((m) => m.src),
  };

  await writeFile(path.join(outDir, "r2-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  await writeFile(path.join(outDir, "gallery.json"), JSON.stringify(gallery, null, 2) + "\n");
  console.log(`[r2] uploaded ${files.length} original + ${files.length} preview; wrote content/galleries/${slug}/gallery.json`);
  console.log(`[r2] gallery password -> ${password}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});