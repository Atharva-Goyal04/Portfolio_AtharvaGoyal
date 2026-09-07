import sharp from "sharp";
import path from "node:path";
import { readFile } from "node:fs/promises";

const ROOT = path.resolve(import.meta.dirname, "..");
const MANIFEST = path.join(ROOT, "src", "data", "image-manifest.json");
const LOCAL_SRC = path.join(ROOT, "public", "images", "favorite", "AG_04225.jpg");

async function sourceBuffer() {
  let url;
  try {
    const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
    url = manifest["/images/favorite/AG_04225.jpg"]?.url;
  } catch {
    url = undefined;
  }
  if (url) {
    try {
      const res = await fetch(url);
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    } catch {
      // fall through to local
    }
  }
  return readFile(LOCAL_SRC);
}
const FONT_BODY = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";
const FONT_MONO = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf";
const OUT = path.join(ROOT, "public", "og.jpg");

const fallbackFont = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf";

async function font(p) {
  try {
    await readFile(p);
    return p;
  } catch {
    return fallbackFont;
  }
}

const [bodyFile, monoFile] = await Promise.all([font(FONT_BODY), font(FONT_MONO)]);

const W = 1200;
const H = 630;

const image = sharp(await sourceBuffer()).resize(W, H, {
  fit: "cover",
  position: "centre",
});

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="rgba(11,14,12,0.45)"/>
  <rect x="0" y="${H - 190}" width="${W}" height="190" fill="rgba(11,14,12,0.78)"/>
  <text x="72" y="150" font-family="'${monoFile.replace(/.*\//, "").replace(/\.ttf$/, "")}'" font-size="24" letter-spacing="10" fill="#B08A4E">PORTFOLIO</text>
  <text x="72" y="392" font-family="'${bodyFile.replace(/.*\//, "").replace(/\.ttf$/, "")}'" font-size="92" fill="#F6F1E7">THE.LUMENCODE</text>
  <text x="74" y="${H - 108}" font-family="'${monoFile.replace(/.*\//, "").replace(/\.ttf$/, "")}'" font-size="34" letter-spacing="4" fill="#F6F1E7">ATHARVA GOYAL</text>
  <text x="74" y="${H - 62}" font-family="'${monoFile.replace(/.*\//, "").replace(/\.ttf$/, "")}'" font-size="22" letter-spacing="6" fill="#C9BCA8">CHASING LIGHT, COLOR &amp; THE MOMENT</text>
</svg>`;

const composite = await image
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .jpeg({ quality: 88 })
  .toBuffer();

await sharp(composite).toFile(OUT);
console.log(`[og] wrote ${path.relative(ROOT, OUT)} (${W}x${H})`);