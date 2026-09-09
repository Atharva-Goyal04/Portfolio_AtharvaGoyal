import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "src", "data", "image-manifest.json");
const maxRuns = Number(process.env.VERIFY_MAX) || Infinity;

async function loadEnv() {
  try {
    const raw = await readFile(path.join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

async function head(url) {
  const res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
  if (res.status >= 500) return { ok: false, status: res.status, type: res.headers.get("content-type") };
  return { ok: res.ok, status: res.status, type: res.headers.get("content-type") };
}

console.log("[verify] checking image manifest + photo URLs…");
const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const entries = Object.entries(manifest);
console.log(`[verify] ${entries.length} manifest entries`);

let failed = 0;
const bad = [];
let checked = 0;

function fail(src, why) {
  failed++;
  bad.push(`${src}: ${why}`);
}

for (const [src, info] of entries) {
  if (!src.startsWith("/images/")) fail(src, "src does not start with /images/");
  if (!(Number(info.width) > 0) || !(Number(info.height) > 0)) fail(src, "missing/zero dimensions");
  if (!info.url) fail(src, "no remote url (local originals were deleted)");
  else if (!info.url.startsWith("https://") || !/^https:\/\/(lumen-cdn\.lumen-cdn\.workers\.dev|.*\.blob\.vercel-storage\.com)/.test(info.url)) {
    fail(src, `unexpected url host: ${info.url}`);
  }
}

for (const [src, info] of Object.entries(manifest)) {
  if (!info.url) continue;
  if (checked >= maxRuns) { console.warn(`[verify] capped at ${maxRuns} URL checks`); break; }
  checked++;
  try {
    const r = await head(info.url);
    if (!r.ok || !(r.type ?? "").startsWith("image/")) fail(src, `HTTP ${r.status} type=${r.type}`);
    else process.stdout.write(".");
  } catch (err) {
    fail(src, `fetch error: ${err instanceof Error ? err.message : err}`);
  }
}
console.log(`\n[verify] ${checked} URLs fetched`);

// R2 end-to-end (only if configured + a sample gallery exists)
await loadEnv();
if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_BUCKET) {
  const { presignGet, r2PreviewKey } = await import(`../lib/r2-sign.ts`);
  const cfg = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
  };
  const sampleDir = path.join(ROOT, "content", "galleries", "_sample");
  try {
    const r2man = JSON.parse(await readFile(path.join(sampleDir, "r2-manifest.json"), "utf8"));
    console.log(`[verify] R2 _sample gallery: ${r2man.length} image(s)`);
    for (const m of r2man) {
      const [, slug, file] = m.src.replace(/^r2:/, "").split("/");
      const url = await presignGet(cfg, r2PreviewKey(slug, file), 900);
      const r = await head(url);
      if (!r.ok || !(r.type ?? "").startsWith("image/")) fail(`r2 ${m.src}`, `HTTP ${r.status}`);
      else process.stdout.write(".");
    }
    console.log("");
  } catch (err) {
    console.log(`[verify] no _sample gallery — R2 e2e skipped (${err instanceof Error ? err.message : err})`);
  }
}

if (failed) {
  console.error(`\n[verify] FAILED — ${failed} problem(s):\n  ${bad.slice(0, 40).join("\n  ")}`);
  process.exit(1);
}
console.log("[verify] ALL OK");