import { readdir, writeFile, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const OUT_DEFAULT = path.join(ROOT, "src", "data", "image-manifest.json");

const CATEGORY_LABELS = {
  street: "Street",
  portrait: "Portrait",
  architecture: "Architecture",
  favorite: "Featured",
  film: "Film",
  "summer-picnic": "Summer Picnic",
};

// Folders that are never scanned: `unsorted` holds photos that still need filing,
// `optimized` holds generated derivatives, `ToCompress` is an archive staging area.
const IGNORE_DIRS = new Set(["unsorted", "optimized", "ToCompress"]);

async function placeholderFor(srcPath) {
  try {
    const buffer = await sharp(srcPath)
      .resize({ width: 16, withoutEnlargement: true })
      .webp({ quality: 60 })
      .toBuffer();
    return `data:image/webp;base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}

async function scanCategories() {
  const entries = await readdir(IMAGES_DIR, { withFileTypes: true });
  const manifest = {};
  for (const entry of entries) {
    if (!entry.isDirectory() || IGNORE_DIRS.has(entry.name)) continue;
    const folder = entry.name;
    const files = await readdir(path.join(IMAGES_DIR, folder));
    for (const file of files.sort()) {
      if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
      if (file.startsWith(".")) continue;
      const filePath = path.join(IMAGES_DIR, folder, file);
      let meta;
      try {
        meta = await sharp(filePath).metadata();
      } catch {
        continue;
      }
      const src = `/images/${folder}/${file}`;
      manifest[src] = {
        category: folder,
        label: CATEGORY_LABELS[folder] ?? folder,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        blur: await placeholderFor(filePath),
      };
    }
  }
  return manifest;
}

function counts(manifest) {
  const per = {};
  for (const src of Object.keys(manifest)) {
    const cat = src.split("/")[2];
    per[cat] = (per[cat] ?? 0) + 1;
  }
  return { total: Object.keys(manifest).length, per };
}

async function report() {
  const manifest = await scanCategories();
  const { total, per } = counts(manifest);
  console.log(`[lumen] ${total} indexed photos`);
  for (const [cat, n] of Object.entries(per).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(cat).padEnd(14)} ${n}`);
  }

  for (const entry of await readdir(IMAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || !IGNORE_DIRS.has(entry.name)) continue;
    const files = (await readdir(path.join(IMAGES_DIR, entry.name))).filter((f) =>
      /\.(jpe?g|png|webp)$/i.test(f),
    );
    if (files.length) {
      console.log(`\n[unsorted] ${files.length} file(s) in ${entry.name}/ not shown on the site:`);
      for (const f of files) console.log(`  ${f}`);
      console.log(
        "  Move each into a category folder (street/portrait/architecture/favorite/film/summer-picnic),\n  then run `npm run images` to index them.",
      );
    }
  }

  const byName = new Map();
  for (const src of Object.keys(manifest)) {
    const file = src.split("/").pop();
    if (!byName.has(file)) byName.set(file, []);
    byName.get(file).push(src.replace(/^\/images\//, "").replace(/\.[a-z0-9]+$/i, ""));
  }
  const dupes = [...byName.entries()].filter(([, v]) => v.length > 1);
  if (dupes.length) {
    console.log(`\n[dupe] ${dupes.length} filename(s) appear in multiple folders (usually edits):`);
    for (const [file, where] of dupes.slice(0, 15)) console.log(`  ${file} -> ${where.join(", ")}`);
    if (dupes.length > 15) console.log(`  …and ${dupes.length - 15} more`);
  }
}

const usage = `Usage: node scripts/lumen.mjs <manifest|report> [out]
  manifest  Scan public/images and write src/data/image-manifest.json
  report    Print an audit of indexed, uncategorized, and duplicate photos`;

async function main() {
  const [command, out = OUT_DEFAULT] = process.argv.slice(2);

  if (command === "report") {
    await report();
    return;
  }

  if (command !== "manifest") {
    console.error(usage);
    process.exit(1);
  }

  const manifest = await scanCategories();
  const text = JSON.stringify(manifest, null, 2);
  await mkdir(path.dirname(out), { recursive: true });
  await rm(out, { force: true });
  await writeFile(out, text + "\n");
  const count = Object.keys(manifest).length;
  const kb = Math.round(Buffer.byteLength(text) / 1024);
  console.log(`[lumen] wrote ${count} images to ${path.relative(ROOT, out)} (${kb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});