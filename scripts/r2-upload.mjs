import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { readFile, readdir, mkdir, writeFile, stat } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { stdin } from "node:process";
import sharp from "sharp";
import exifr from "exifr";
import {
  r2OriginalKey,
  r2PreviewKey,
  portfolioOriginalKey,
  portfolioPreviewKey,
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

const usage = `Usage: node scripts/r2-upload.mjs <mode> <slug> [sourceDir] [flags]

Modes:
  gallery   Upload client gallery (existing behavior)
  portfolio Upload entire portfolio from public/images/

Gallery mode:
  node scripts/r2-upload.mjs gallery <slug> [sourceDir] [flags]
    Uploads full-res originals + webp previews to gallery/<slug>/<file>
    Writes content/galleries/<slug>/gallery.json with branded password

Portfolio mode:
  node scripts/r2-upload.mjs portfolio [--refresh]
    Walks public/images/<category>/<project>/*.jpg
    Uploads originals + 1600px webp previews to portfolio/<category>/<project>/
    Outputs manifest to src/data/image-manifest.json

Gallery flags (all optional; empty = reuse what's already in the card):
  --client "Name"   --email x@y.com   --phone 555-0100
  --status upcoming|delivered|archived   --notes "Free text"
  --refresh         no upload — just re-sync the card from existing gallery.json

Portfolio flags:
  --refresh         no upload — just regenerate manifest from existing R2 files
`;

const mode = process.argv[2] ?? "gallery";
const slug = mode === "gallery" ? process.argv[3] : undefined;
const refreshOnly = process.argv.includes("--refresh") || process.argv.includes("--update-only");

const sourceDir = mode === "gallery" ? (process.argv[4] ?? path.join(ROOT, "deliverables", slug)) : undefined;

if (mode === "gallery") {
  if (!slug || (!refreshOnly && !fs.existsSync(sourceDir))) {
    console.error(usage);
    process.exit(1);
  }
} else if (mode === "portfolio") {
  // portfolio mode doesn't need slug
} else {
  console.error(usage);
  process.exit(1);
}

const flags = { client: "", email: "", phone: "", status: "", notes: "" };
{
  const raw = process.argv.slice(4);
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2).toLowerCase();
    if (key in flags && raw[i + 1]) flags[key] = raw[++i];
  }
}

const prompt = (question) =>
  new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

const STATUS_CHOICES = { "1": "Upcoming", "2": "Delivered", "3": "Archived" };

async function collectClientFields() {
  if (!process.stdin.isTTY || process.argv.includes("--non-interactive")) return;
  const need = refreshOnly || !flags.client || !flags.email || !flags.phone || !flags.status || !flags.notes;
  if (!need) return;
  console.log("\n  Client tracker — press Enter to leave a field unchanged");
  if (!flags.client) flags.client = (await prompt("    Client name : ")) || "";
  if (!flags.email) flags.email = (await prompt("    Email       : ")) || "";
  if (!flags.phone) flags.phone = (await prompt("    Phone       : ")) || "";
  if (!flags.status) {
    const choice = (await prompt("    Status [1 Upcoming] [2 Delivered] [3 Archived]: ")) || "";
    flags.status = STATUS_CHOICES[choice.trim()] ?? "";
  }
  if (!flags.notes) flags.notes = (await prompt("    Notes       : ")) || "";
  if (flags.client || flags.email || flags.phone || flags.status || flags.notes) {
    console.log("  — card updated.");
  }
}

const generatePassword = () =>
  `LUMEN-${randomBytes(5).toString("hex").toUpperCase()}`;

const SITE_BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://atharvagoyal.com"
).replace(/\/+$/, "");

const CLIENTS_FILE = path.join(ROOT, "deliverables", "clients.html");

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const STATUSES = ["Upcoming", "Delivered", "Archived"];
const normalizeStatus = (s) => {
  if (!s) return null;
  return STATUSES.find((x) => x.toLowerCase() === String(s).toLowerCase()) ?? null;
};

const renderClientsPage = (clients) => {
  const card = (c) => `
    <article class="card${c.status ? ` status-${c.status.toLowerCase()}` : ""}">
      <div class="card-head">
        <h2>${esc(c.client || c.slug || "—")}</h2>
        ${c.status ? `<span class="pill">${esc(c.status)}</span>` : ""}
      </div>
      <div class="contact">
        ${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ""}
        ${c.phone ? `<a href="tel:${esc(c.phone.replace(/\s+/g, ""))}">${esc(c.phone)}</a>` : ""}
        ${!c.email && !c.phone ? '<span class="dim">no contact yet</span>' : ""}
      </div>
      <div class="meta">
        ${c.title ? `<span>${esc(c.title)}</span>` : ""}
        ${c.date ? `<span class="dim">${esc(c.date)}</span>` : ""}
      </div>
      <div class="row">
        <a class="link" href="${esc(c.link)}" target="_blank" rel="noreferrer">Open gallery ↗</a>
        <div class="pw-row">
          <code class="pw">${esc(c.password)}</code>
          <button type="button" data-copy="${esc(c.password)}">Copy</button>
        </div>
      </div>
      <p class="notes">${esc(c.notes) || '<span class="dim">No notes.</span>'}</p>
    </article>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>THE.LUMENCODE — Client Tracker</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #16120e;
    color: #e9e2d6;
    font: 15px/1.55 ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  }
  main { max-width: 760px; margin: 0 auto; padding: 56px 24px 64px; }
  header { border-bottom: 1px solid rgba(201,169,126,0.25); padding-bottom: 20px; margin-bottom: 28px; }
  header h1 { margin: 0; font-size: 22px; letter-spacing: 0.24em; color: #c9a97e; }
  header p { margin: 8px 0 0; text-transform: uppercase; letter-spacing: 0.18em; font-size: 11px; color: #8a8378; }
  .note { font-size: 12px; color: #8a8378; margin: 0 0 28px; }
  .card {
    background: #211b15;
    border: 1px solid rgba(201,169,126,0.15);
    border-radius: 14px;
    padding: 22px 24px;
    margin-bottom: 18px;
  }
  .card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .card-head h2 { margin: 0; font-size: 18px; letter-spacing: 0.02em; }
  .pill {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em;
    border: 1px solid rgba(201,169,126,0.4); color: #d9b98a;
    border-radius: 999px; padding: 3px 12px; white-space: nowrap;
  }
  .status-delivered .pill { border-color: rgba(110,180,120,0.5); color: #8fd09a; }
  .status-archived .pill { border-color: rgba(140,134,124,0.4); color: #a89d8c; }
  .contact a { color: #e9e2d6; text-decoration: none; border-bottom: 1px solid rgba(201,169,126,0.3); margin-right: 14px; }
  .contact a:hover { color: #d9b98a; }
  .meta { color: #a89d8c; margin: 10px 0 14px; font-size: 13px; }
  .meta .dim + span { margin-left: 14px; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .link { color: #c9a97e; text-decoration: none; font-weight: 600; }
  .link:hover { text-decoration: underline; }
  .pw-row { display: flex; align-items: center; gap: 8px; }
  .pw { color: #d9b98a; font-weight: 700; letter-spacing: 0.08em; background: rgba(201,169,126,0.08); padding: 5px 10px; border-radius: 8px; }
  .pw-row button {
    background: transparent; color: #8a8378; border: 1px solid rgba(201,169,126,0.3);
    border-radius: 8px; padding: 5px 12px; font: inherit; font-size: 12px; cursor: pointer;
  }
  .pw-row button:hover { color: #e9e2d6; border-color: rgba(201,169,126,0.6); }
  .notes { margin: 14px 0 0; font-size: 13px; color: #c8c0b2; border-top: 1px solid rgba(201,169,126,0.1); padding-top: 12px; }
  .dim { color: #8a8378; }
  .empty { border: 1px dashed rgba(201,169,126,0.3); border-radius: 14px; padding: 40px; text-align: center; color: #8a8378; }
  footer { margin-top: 28px; font-size: 11px; color: #6f6a60; text-transform: uppercase; letter-spacing: 0.14em; }
</style>
</head>
<body>
<main>
  <header>
    <h1>THE.LUMENCODE</h1>
    <p>Client &amp; gallery tracker</p>
  </header>
  <p class="note">Keep this file private — it is git-ignored and never deployed. Managed fields (password, title, date, link) refresh automatically on upload.</p>
  ${
    clients.length
      ? clients.map(card).join("\n")
      : '<p class="empty">No clients yet — upload your first gallery.</p>'
  }
  <footer>Generated by scripts/r2-upload.mjs</footer>
</main>
<script>
  document.querySelectorAll("button[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.getAttribute("data-copy") || "");
        const label = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = label), 1200);
      } catch {}
    });
  });
</script>
</body>
</html>
`;
};

const jsonExport = (clients) =>
  `<script id="data" type="application/json">${JSON.stringify({ clients }).replace(/</g, "\\u003c")}</script>`;

async function upsertClientFile({ slug, password, title, date }) {
  let clients = [];
  try {
    const html = await readFile(CLIENTS_FILE, "utf8");
    const m = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
    if (m) {
      const parsed = JSON.parse(m[1]);
      clients = Array.isArray(parsed?.clients) ? parsed.clients : [];
    }
  } catch {
    // file not created yet (or malformed — starts fresh)
  }

  const existing = clients.find((c) => c.slug === slug);
  const merged = existing ?? { slug };
  if (flags.client) merged.client = flags.client;
  if (flags.email) merged.email = flags.email;
  if (flags.phone) merged.phone = flags.phone;
  if (flags.notes) merged.notes = flags.notes;
  const status = normalizeStatus(flags.status);
  if (status) merged.status = status;
  if (!existing) merged.status ??= "Upcoming";

  merged.title = title ?? "";
  merged.date = date ?? "";
  merged.password = password;
  merged.link = `${SITE_BASE}/gallery/${slug}`;

  clients = clients.filter((c) => c.slug !== slug);
  clients.push(merged);
  clients.sort((a, b) => (b.date || "").localeCompare(a.date || "") || a.slug.localeCompare(b.slug));

  const page = renderClientsPage(clients);
  await writeFile(CLIENTS_FILE, page.replace("</main>", `</main>\n${jsonExport(clients)}`));
}

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

const CAMERA_MAP = {
  "ILCE-7M4": "Sony a7 IV",
  "ILCE-6700": "Sony a6700",
  "ILCE-3000": "Sony α3000",
  "NIKON D3100": "Nikon D3100",
};

function normalizeCamera(model) {
  return CAMERA_MAP[model] ?? model;
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function extractExif(filePath) {
  try {
    const data = await exifr.parse(filePath, { exif: true, iptc: false, xmp: false, icc: false });
    const rawModel = data.Model ?? "";
    const rawLens = data.LensModel ?? "";
    const focalLength = data.FocalLength ? `${Math.round(data.FocalLength)}mm` : undefined;
    const aperture = data.FNumber ? `f/${data.FNumber}` : undefined;
    const shutterSpeed = data.ExposureTime ? formatShutter(data.ExposureTime) : undefined;
    const iso = data.ISOSpeedRatings ? `ISO ${data.ISOSpeedRatings}` : undefined;

    // Film scanner detection
    const isFilmScan = /NORITSU|FRONTIER|FUJI|SP-3000|EZ Controller/i.test(rawModel);

    return {
      camera: isFilmScan ? "Pentax Espio 738" : normalizeCamera(rawModel),
      lens: isFilmScan ? "35mm Film" : rawLens || undefined,
      focalLength,
      aperture,
      shutterSpeed,
      iso,
      isFilm: isFilmScan,
    };
  } catch {
    return { camera: "Unknown", lens: undefined, focalLength: undefined, aperture: undefined, shutterSpeed: undefined, iso: undefined, isFilm: false };
  }
}

function formatShutter(time) {
  if (time >= 1) return `${time}s`;
  const denom = Math.round(1 / time);
  return `1/${denom}s`;
}

function naturalSort(a, b) {
  const re = /(\d+)|(\D+)/g;
  const aParts = a.match(re) ?? [];
  const bParts = b.match(re) ?? [];
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] ?? "";
    const bPart = bParts[i] ?? "";
    const aNum = parseInt(aPart, 10);
    const bNum = parseInt(bPart, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else if (aPart !== bPart) {
      return aPart.localeCompare(bPart);
    }
  }
  return 0;
}

async function uploadPortfolio() {
  const imagesDir = path.join(ROOT, "public", "images");
  const manifest = {};
  const workerBase = "https://lumen-cdn.lumen-cdn.workers.dev";

  if (!fs.existsSync(imagesDir)) {
    console.error("[r2] public/images does not exist");
    process.exit(1);
  }

  const categories = (await readdir(imagesDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "optimized")
    .map((d) => d.name);

  for (const category of categories) {
    const catDir = path.join(imagesDir, category);
    const catSlug = slugify(category);
    const catLabel = category
      .split(/[\s_-]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    const entries = await readdir(catDir, { withFileTypes: true });
    const projects = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));
    const flatFiles = entries.filter((e) => e.isFile() && /\.(jpe?g|png|webp|heic)$/i.test(e.name));

    if (flatFiles.length > 0 && projects.length === 0) {
      // Flat category (like ARCHITECTURE) = single implicit project
      const projectSlug = catSlug;
      const files = flatFiles.map((f) => f.name).sort(naturalSort);
      const coverFile = files[0];

      for (const file of files) {
        const filePath = path.join(catDir, file);
        const statInfo = await stat(filePath);
        const exif = await extractExif(filePath);
        const originalKey = portfolioOriginalKey(catSlug, projectSlug, file);
        const previewKey = portfolioPreviewKey(catSlug, projectSlug, file);
        const previewUrl = `${workerBase}/${previewKey}`;

        if (!refreshOnly) {
          const body = await readFile(filePath);
          await put(originalKey, body, mime(file));
          const preview = await sharp(body).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
          await put(previewKey, preview, "image/webp");
        }

        const src = `/images/${catSlug}/${projectSlug}/${file}`;
        manifest[src] = {
          category: catSlug,
          label: catLabel,
          project: projectSlug,
          projectTitle: catLabel,
          width: 0,
          height: 0,
          blur: "",
          url: previewUrl,
          camera: exif.camera,
          lens: exif.lens,
          focalLength: exif.focalLength,
          aperture: exif.aperture,
          shutterSpeed: exif.shutterSpeed,
          iso: exif.iso,
          isFilm: exif.isFilm,
          _localPath: filePath,
        };

        // Get dimensions for manifest
        try {
          const meta = await sharp(filePath).metadata();
          manifest[src].width = meta.width ?? 0;
          manifest[src].height = meta.height ?? 0;
        } catch {}
      }
      continue;
    }

    for (const project of projects) {
      const projectSlug = slugify(project.name);
      const projDir = path.join(catDir, project.name);
      const files = (await readdir(projDir))
        .filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f) && !f.startsWith("."))
        .sort(naturalSort);

      if (!files.length) continue;

      for (const file of files) {
        const filePath = path.join(projDir, file);
        const exif = await extractExif(filePath);
        const originalKey = portfolioOriginalKey(catSlug, projectSlug, file);
        const previewKey = portfolioPreviewKey(catSlug, projectSlug, file);
        const previewUrl = `${workerBase}/${previewKey}`;

        if (!refreshOnly) {
          const body = await readFile(filePath);
          await put(originalKey, body, mime(file));
          const preview = await sharp(body).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
          await put(previewKey, preview, "image/webp");
        }

        const src = `/images/${catSlug}/${projectSlug}/${file}`;
        manifest[src] = {
          category: catSlug,
          label: catLabel,
          project: projectSlug,
          projectTitle: project.name
            .split(/[\s_-]+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" "),
          width: 0,
          height: 0,
          blur: "",
          url: previewUrl,
          camera: exif.camera,
          lens: exif.lens,
          focalLength: exif.focalLength,
          aperture: exif.aperture,
          shutterSpeed: exif.shutterSpeed,
          iso: exif.iso,
          isFilm: exif.isFilm,
          _localPath: filePath,
        };

        try {
          const meta = await sharp(filePath).metadata();
          manifest[src].width = meta.width ?? 0;
          manifest[src].height = meta.height ?? 0;
        } catch {}
      }
    }
  }

  // Generate blur placeholders and write manifest
  console.log("[r2] generating blur placeholders...");
  for (const src of Object.keys(manifest)) {
    const entry = manifest[src];
    if (entry._localPath && fs.existsSync(entry._localPath)) {
      try {
        const buffer = await sharp(entry._localPath)
          .resize({ width: 16, withoutEnlargement: true })
          .webp({ quality: 60 })
          .toBuffer();
        entry.blur = `data:image/webp;base64,${buffer.toString("base64")}`;
      } catch {}
    }
    delete entry._localPath;
  }

  const outPath = path.join(ROOT, "src", "data", "image-manifest.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`[r2] wrote manifest with ${Object.keys(manifest).length} images to ${path.relative(ROOT, outPath)}`);
}

async function main() {
  if (mode === "portfolio") {
    await uploadPortfolio();
    return;
  }

  // Gallery mode (existing logic)
  if (refreshOnly) {
    const gf = path.join(ROOT, "content", "galleries", slug, "gallery.json");
    if (!fs.existsSync(gf)) {
      console.error(`[r2] no existing gallery at ${gf}`);
      process.exit(1);
    }
    const g = JSON.parse(await readFile(gf, "utf8"));
    await collectClientFields();
    await upsertClientFile({
      slug,
      password: g.password ?? "",
      title: g.title ?? slug,
      date: g.date ?? "",
    });
    console.log(`[r2] tracker card refreshed for "${slug}" (no upload)`);
    return;
  }

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
  await collectClientFields();
  await upsertClientFile({
    slug,
    password,
    title: gallery.title,
    date: gallery.date,
  });
  console.log(`[r2] uploaded ${files.length} original + ${files.length} preview; wrote content/galleries/${slug}/gallery.json`);
  console.log(`[r2] gallery password -> ${password} (tracker saved to deliverables/clients.html)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});