import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const IMG = path.resolve(import.meta.dirname, "..", "public", "images");
const CATS = ["street", "portrait", "architecture", "favorite", "film", "summer-picnic"];

async function hash256(file) {
  const { data } = await sharp(file).resize({ width: 16, height: 16, fit: "fill" }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  let h = 0n;
  for (const px of data) h = (h << 1n) | BigInt(px >= mean ? 1 : 0);
  return { hash: h, mean };
}
const popcount = (x) => { let c = 0; while (x) { x &= x - 1n; c++; } return c; };

const index = [];
for (const cat of CATS) {
  const dir = path.join(IMG, cat);
  let files = [];
  try { files = await readdir(dir); } catch { continue; }
  for (const f of files) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
    const h = await hash256(path.join(dir, f));
    index.push({ file: f, cat, hash: h.hash, mean: h.mean });
  }
}
const byName = new Map(index.map((i) => [i.file, i]));
const prefix = (f) => f.replace(/-\d+|\.\w+$/g, "").split(/[_\d]/)[0];

const lone = (await readdir(path.join(IMG, "unsorted"))).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const results = [];
for (const f of lone.sort()) {
  const { hash } = await hash256(path.join(IMG, "unsorted", f));
  let best = null;
  for (const cand of index) {
    const d = popcount(hash ^ cand.hash);
    if (!best || d < best.d || (d === best.d && prefix(f) === prefix(cand.file))) best = { d, cat: cand.cat, near: cand.file };
  }
  results.push({ file: f, d: best.d, cat: best.cat, near: best.near });
}
for (const r of results.sort((a, b) => a.d - b.d) || []) {
  console.log(`${r.file.padEnd(28)} d=${String(r.d).padEnd(3)} -> ${r.cat.padEnd(14)} (near ${r.near})`);
}
