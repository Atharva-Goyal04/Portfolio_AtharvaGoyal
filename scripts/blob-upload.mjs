import { readFile, readdir as fsReaddir } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const MANIFEST = path.join(ROOT, "src", "data", "image-manifest.json");

// Load .env.local by hand so the write token never has to live in the shell.
const envPath = path.join(ROOT, ".env.local");
try {
  const raw = await readFile(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // no .env.local — fine if env vars are exported already
}

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error("[blob] BLOB_READ_WRITE_TOKEN is missing (put it in .env.local first).");
  process.exit(1);
}

const IGNORED = new Set(["optimized", "ToCompress", "unsorted", "all"]);
const mime = (f) => {
  const ext = path.extname(f).toLowerCase();
  return ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";
};

async function localImages() {
  const entries = await fsReaddir(IMAGES_DIR, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    if (entry.isDirectory() && !IGNORED.has(entry.name)) {
      const files = (await fsReaddir(path.join(IMAGES_DIR, entry.name))).filter((f) =>
        /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith("."),
      );
      for (const file of files) out.push({ folder: entry.name, file });
    } else if (entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name) && !entry.name.startsWith(".")) {
      out.push({ folder: "", file: entry.name });
    }
  }
  return out.sort((a, b) => `${a.folder}/${a.file}`.localeCompare(`${b.folder}/${b.file}`));
}

async function main() {
  const images = await localImages();
  console.log(`[blob] uploading ${images.length} image(s) to Vercel Blob…`);

  const manifest = fs.existsSync(MANIFEST)
    ? JSON.parse(await readFile(MANIFEST, "utf8"))
    : {};

  const failures = [];
  for (const { folder, file } of images) {
    const key = folder ? `${folder}/${file}` : file;
    const src = `/images/${key}`;
    const filePath = path.join(IMAGES_DIR, folder, file);
    try {
      const { url } = await put(key, fs.createReadStream(filePath), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 31536000,
        contentType: mime(file),
      });
      manifest[src] = { ...(manifest[src] ?? {}), url };
    } catch (err) {
      failures.push(`${key}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (failures.length) {
    console.error("[blob] FAILED uploads:\n" + failures.map((f) => `  ${f}`).join("\n"));
    process.exit(1);
  }

  await fs.promises.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`[blob] done — ${images.length} URLs recorded in src/data/image-manifest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});