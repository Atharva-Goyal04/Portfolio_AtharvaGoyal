import { fileURLToPath } from "node:url";
import { readFile, readdir, writeFile, mkdir, rm } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

// Stories are hand-authored JSON now (src/data/stories/). This script only runs
// on explicit opt-in (PARSE_STORIES=1). Running it unguarded would regenerate
// stories from RTF source and prune hand-authored JSON that has no RTF file.
if (process.env.PARSE_STORIES !== "1") {
  console.warn(
    "[parse-stories] disabled: stories are hand-authored JSON. Set PARSE_STORIES=1 to run.",
  );
  process.exit(0);
}

/*
 * Story source of truth: the photographer's own narrative files (*.rtf) living
 * inside public/images/<CATEGORY>/<PROJECT>/.
 *
 * Only projects with a genuine author-written narrative are eligible for a
 * story page. The full narrative is preserved verbatim as `sections` (never
 * invented), structured data (chapters, image references, favorite images)
 * from the RTF enriches the existing curated story JSON.
 *
 * Category slugs are taken from the image manifest (the authoritative mapping
 * the UI renders with), never from disk folder names, which may drift.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const OUT_DIR = path.join(ROOT, "src", "data", "stories");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "image-manifest.json");

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeFile(file) {
  return String(file)
    .trim()
    .replace(/[\"'\u2018\u2019\u201c\u201d]/g, "")
    .replace(/\.(jpe?g|png|heic|tiff|webp)$/i, "")
    .toLowerCase();
}

function parseRTF(rtf) {
  let text = rtf
    .replace(/\\par\b|\\pard\b|\\line\b|\\tab\b/gi, "\n")
    .replace(/\\cf\d+|\\strokec\d+|\\expndtw\d+|\\expnd\d+|\\kerning\d+|\\f\d+|\\fs\d+|\\b0?|\\i0?|\\ul|\\ulc\d+|\\outl\d+|\\strokewidth\d+|\\li\d+|\\fi-\d+|\\sa\d+|\\partightenfactor\d+|\\tx\d+|\\ls\d+|\\ilvl\d+|\\listtext|\\'[0-9a-f]{2}|\\uc\d+|\\u-?\d+/gi, "")
    .replace(/\\'/g, "'")
    .replace(/\\~/g, " ")
    .replace(/\\_/g, " ")
    .replace(/\\-/g, " ")
    .replace(/\\\(/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\\[a-z]+\d*\s?/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

// Boundary markers that terminate the narrative and begin structured sections.
const BOUNDARY_RE =
  /^(visual chapters?|favorite image\b|featured images?|closing story|project metadata|websites? presentation|image references?|image display instructions|external references?|opencode implementation notes|implementation notes|project details|technical notes|project type\b|shoot type\b|equipment\b|location\b)\b/i;
const ALLCAPS_COLON_RE = /^[A-Z][A-Z0-9 &'+\u2019:()-]{5,}:\s*$/;

const FIELD_LABEL_RE =
  /^(Display title|Editorial title|Title|Image description|Description|Story connection|Role|Importance|Technique|Visual direction)\s*[:]\s*(.*)$/i;

const norm = (l) => String(l).trim().replace(/\\$/, "");

// "Image: <file>" / "1. File: <file>" or "<key>:" with the file on the next line.
function resolveFile(lines, i) {
  const line = norm(lines[i]);
  const m = line.match(/^(?:\d+\.\s*)?(?:image|file)\s*[:\-]\s*(.*)$/i);
  if (!m) return null;
  if (m[1].trim()) return { file: normalizeFile(m[1].trim()), next: i + 1 };
  for (let j = i + 1; j < lines.length; j++) {
    const l = norm(lines[j]);
    if (!l) continue;
    return { file: normalizeFile(l), next: j + 1 };
  }
  return null;
}

// Returns { key } if the line is a "Field:" label (value may be inline or on the
// next non-empty line), else { value } when the line is a continuation value.
function matchField(raw, cur) {
  const f = raw.match(FIELD_LABEL_RE);
  if (!f || !cur) return null;
  const key = FIELD_KEYS[f[1].toLowerCase()];
  if (!key) return null;
  return { key, inline: f[2].trim() };
}

function consumeFieldLine(cur, lastField, raw) {
  // Append continuation value onto an unfilled or unfinished field value.
  const current = cur.fields[lastField];
  if (raw && (current === undefined || current === "" || !/[.!?"]\s*$/.test(current))) {
    cur.fields[lastField] = current ? `${current} ${raw}` : raw;
    return true;
  }
  return false;
}

function parseRefs(lines) {
  const refs = {};
  let cur = null;
  let lastField = null;
  for (let i = 0; i < lines.length; i++) {
    const line = norm(lines[i]);
    const rf = resolveFile(lines, i);
    if (rf) {
      i = rf.next - 1;
      const file = rf.file;
      cur = refs[file] !== undefined ? refs[file] : (refs[file] = { file });
      lastField = null;
      continue;
    }
    if (!cur) continue;
    const field = matchField(line, cur);
    if (field) {
      cur.fields = cur.fields || {};
      cur.fields[field.key] = field.inline;
      lastField = field.key;
      continue;
    }
    if (lastField && consumeFieldLine(cur, lastField, line)) continue;
  }
  return Object.fromEntries(Object.entries(refs).map(([k, v]) => [k, { ...v, ...(v.fields || {}) }]));
}

function parseChapters(lines) {
  let start = null;
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const ln = norm(lines[i]);
    if (start === null && /^visual chapters?\b/i.test(ln)) {
      start = i + 1;
      continue;
    }
    if (start !== null && (BOUNDARY_RE.test(ln) || ALLCAPS_COLON_RE.test(ln))) {
      end = i;
      break;
    }
  }
  if (start === null) return [];

  let pending = [];
  let cur = null;
  let lastField = null;
  const blocks = [];
  for (let i = start; i < end; i++) {
    const raw = norm(lines[i]);
    const rf = resolveFile(lines, i);
    if (rf) {
      i = rf.next - 1;
      cur = { file: rf.file, intro: pending, fields: {} };
      pending = [];
      lastField = null;
      blocks.push(cur);
      continue;
    }
    const field = matchField(raw, cur);
    if (field) {
      cur.fields[field.key] = field.inline;
      lastField = field.key;
      continue;
    }
    if (cur && lastField && consumeFieldLine(cur, lastField, raw)) continue;
    pending.push(raw);
  }
  if (process.env.DBG_CH) console.error(`[DBG-CH] start=${start} end=${end} blocks=${blocks.length}`, blocks.map((b) => `${b.file} intro=${b.intro.length} clean="${cleanIntro(b.intro).slice(0, 40)}"`).join(" | "));
  return blocks;
}

// Narrative filename tokens look like "portrait-thequiethour-4".
const FILE_TOKEN = /\b[a-z][a-z0-9_-]*[_-]\d+(?:\.(?:jpe?g|png|heic|tiff))?/gi;

const FIELD_KEYS = {
  "display title": "editorialTitle",
  "editorial title": "editorialTitle",
  title: "title",
  "image description": "description",
  description: "description",
  "story connection": "storyConnection",
  role: "role",
  importance: "importance",
  technique: "technique",
  "visual direction": "visualDirection",
};

function isHeading(p) {
  const stripped = p.trim();
  if (stripped.length > 60) return false;
  if (/[.;:!?]\s*$/i.test(stripped)) return false;
  const words = stripped.split(/\s+/).filter(Boolean);
  return words.length <= 4 && !/\b(i|my|we|the|a|it|this|that)\b/i.test(stripped);
}

function isEditingPara(p) {
  if (p.length < 60) return false;
  return /\b(?:edited|editing|went through and (?:edit|process)|post[- ]processing|post[- ]process\b)/i.test(p);
}

function cleanIntro(lines) {
  const cleaned = [];
  for (const ln of lines) {
    const t = ln.trim();
    if (!t) continue;
    if (t.length <= 44 && !/[.;:!?]\s*$/.test(t) && t.split(/\s+/).length <= 4) continue; // chapter label line
    cleaned.push(t);
  }
  return cleaned.join(" ").trim();
}

async function findStoryFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findStoryFiles(fullPath)));
    } else if (/\.(rtf|txt|md)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function parseStoryFile(rtfPath) {
  const raw = await readFile(rtfPath, "utf8");
  const text = parseRTF(raw);
  const lines = text.split("\n");

  const story = {
    projectTitle: "",
    projectType: "",
    location: "",
    time: "",
    camera: "",
    lens: "",
    coverImage: "",
  };

  const titleMatch = text.match(/PROJECT:\s*([^\n]+)/i);
  if (titleMatch) story.projectTitle = titleMatch[1].trim();

  const typeMatch = text.match(/Project type:\s*([^\n]+)/i);
  if (typeMatch) story.projectType = typeMatch[1].trim();

  const locMatch = text.match(/Location:\s*([^\n]+)/i);
  if (locMatch) story.location = locMatch[1].trim();

  const timeMatch = text.match(/(?:Time|Time period|Occasion|Season):\s*([^\n]+)/i);
  if (timeMatch) story.time = timeMatch[1].trim();

  const camMatch = text.match(/Camera[^:]*:([\s\S]*?)(?=\n\n|\n[A-Z][a-z]+:?|\nLens)/i);
  if (camMatch) story.camera = camMatch[1].trim();

  const lensMatch = text.match(/Lens[^:]*:\s*([^\n]+)/i);
  if (lensMatch) story.lens = lensMatch[1].trim();

  const coverMatch = text.match(/Cover image:\s*([^\n]+)/i);
  if (coverMatch) story.coverImage = normalizeFile(coverMatch[1]);

  return { story, lines, text };
}

const JUNK_RE = /\b(fonttbl|colortbl|helvetica|arial|times-new|times|courier|monaco|applecoloremoji|lue\d+)\b/i;

function isContentLine(raw) {
  const line = String(raw).trim().replace(/\\$/, "");
  if (!line) return false;
  if (!/[a-zA-Z]{2,}/.test(line)) return false;
  if (/\\/.test(line)) return false;
  if (JUNK_RE.test(line)) return false;
  if (/^[\d\s;:*'.\-]+$/.test(line)) return false;
  return true;
}

function buildNarrative(text, lines, refs) {
  const paragraphs = [];
  let cur = "";
  const flush = () => {
    if (cur.trim()) paragraphs.push(cur.trim());
    cur = "";
  };

  for (const raw of lines) {
    const line = String(raw).trim().replace(/\\$/, "");
    if (!isContentLine(line)) continue;
    if (/^project\s*(story)?\s*:?\s*$/i.test(line)) continue; // "PROJECT:" / "Project Story" headers
    const titleHeader = line.match(/^project\s*:\s*(.+)$/i);
    if (titleHeader) continue; // "PROJECT: <title>" line
    if (/^project story\s*:\s*(.+)$/i.test(line)) {
      // narrative starts on the same line
      const rest = line.replace(/^project story\s*:\s*/i, "").trim();
      if (!rest) continue;
      cur = cur ? `${cur} ${rest}` : rest;
      continue;
    }
    if (BOUNDARY_RE.test(line) || ALLCAPS_COLON_RE.test(line)) {
      flush();
      break; // narrative section ends at first structured header
    }

    const endsSentence = /[.!?"]\s*$/.test(line);
    const startsUpper = /^[A-Z]/.test(line);
    if (!cur) {
      cur = line;
    } else if (endsSentence && startsUpper && /[.!?"]\s*$/.test(cur)) {
      flush();
      cur = line;
    } else {
      cur += " " + line;
    }
  }
  flush();

  const sections = [];
  const editing = [];
  const conclusion = [];
  let inConclusion = false;

  const tokens = new Set();
  for (const m of text.matchAll(FILE_TOKEN)) {
    tokens.add(normalizeFile(m[0].toLowerCase()));
  }

  for (const p of paragraphs) {
    if (/^looking back[\s,:!]|^what i (?:like|love) most/gi.test(p)) inConclusion = true;
    if (inConclusion) {
      conclusion.push(p);
      continue;
    }
    if (isHeading(p)) continue;
    if (isEditingPara(p)) {
      editing.push(p);
      continue;
    }

    const mentioned = [...p.matchAll(FILE_TOKEN)]
      .map((m) => normalizeFile(m[0].toLowerCase()))
      .filter((t) => tokens.has(t));

    const item = { text: p };
    if (mentioned.length) item.image = mentioned[0];
    sections.push(item);
  }

  // Story-to-image display instructions (e.g. halloween):
  // ">>> When the story discusses X, display "Title" (file) near that section."
  const displayRegex = /(?:>>>\s*)?When the story discusses\s+(.+?)\s*[,.]\s*display\s+"([^"]+)"\s*\(\s*([\w-]+)\s*\)/gi;
  let dm;
  while ((dm = displayRegex.exec(text)) !== null) {
    const keyword = dm[1].trim().replace(/["']/g, "");
    const file = normalizeFile(dm[3].toLowerCase());
    const rtTitle = dm[2].trim();
    for (const item of sections) {
      if (item.text.includes(keyword)) {
        item.related = item.related || [];
        const r = refs[file] || {};
        item.related.push({
          file,
          title: r.editorialTitle || rtTitle,
          description: r.description || "",
          storyConnection: r.storyConnection || "",
        });
        break;
      }
    }
  }

  const out = { sections };
  if (editing.length) out.editingStory = editing.join("\n\n");
  if (conclusion.length) out.conclusion = conclusion.join("\n\n");
  return out;
}

function enrichWithRefs(chapter, refs) {
  const imgs = (chapter.images || []).map((img) => {
    const ref = refs[normalizeFile((img.file || "").toLowerCase())];
    if (!ref) return img;
    return {
      ...img,
      editorialTitle: ref.editorialTitle || img.editorialTitle,
      description: ref.description || img.description,
      role: ref.role || img.role,
      ...(ref.storyConnection ? { storyConnection: ref.storyConnection } : {}),
    };
  });
  return { ...chapter, images: imgs };
}

function applyChapterStories(chapters, blocks, refs) {
  const matched = new Set();
  const result = (chapters || []).map((ch) => ({ ...ch, images: [...(ch.images || [])] }));

  for (const blk of blocks) {
    const file = blk.file;
    let idx = result.findIndex(
      (ch, i) =>
        !matched.has(i) &&
        (ch.images || []).some((img) => {
          const nf = normalizeFile((img.file || "").toLowerCase());
          return nf === file || nf.includes(file) || file.includes(nf);
        }),
    );
    if (idx === -1) idx = result.findIndex((ch, i) => !matched.has(i));
    if (idx === -1) continue;
    matched.add(idx);

    const story = cleanIntro(blk.intro);
    if (story && story.length >= 12) result[idx].story = story;

    const fields = blk.fields || {};
    const targetIdx = (result[idx].images || []).findIndex((img) => {
      const nf = normalizeFile((img.file || "").toLowerCase());
      return nf === file || nf.includes(file) || file.includes(nf);
    });
    if (targetIdx !== -1) {
      const target = result[idx].images[targetIdx];
      const ref = refs[file] || {};
      result[idx].images[targetIdx] = {
        ...target,
        editorialTitle: fields.editorialTitle || ref.editorialTitle || target.editorialTitle,
        description: fields.description || ref.description || target.description,
        role: fields.role || ref.role || target.role,
        ...((fields.storyConnection || ref.storyConnection)
          ? { storyConnection: fields.storyConnection || ref.storyConnection }
          : {}),
      };
    }
  }

  return result.map((ch) => enrichWithRefs(ch, refs));
}

async function main() {
  const storyFiles = await findStoryFiles(IMAGES_DIR);
  console.log(`Found ${storyFiles.length} story files`);

  // Authoritative category mapping from the image manifest.
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const catByProject = {};
  for (const info of Object.values(manifest)) {
    if (!catByProject[info.project]) catByProject[info.project] = info.category;
  }

  await mkdir(OUT_DIR, { recursive: true });

  const emitted = [];
  const skipped = [];

  for (const file of storyFiles) {
    const relPath = path.relative(IMAGES_DIR, file);
    const segments = relPath.split(path.sep);
    if (segments.length < 2) continue; // docs directly in the images root
    const diskCategory = segments[0];
    const project = segments.slice(1, -1).join("/") || diskCategory;
    const slug = slugify(project);

    const parsed = await parseStoryFile(file);
    const { text, lines } = parsed;
    const story = parsed.story;

    const eligible = /project/i.test(text) && /(story|chapters?|image references|closing|visual chapters)/i.test(text);
    if (!eligible) {
      skipped.push(`${diskCategory}/${project}`);
      continue;
    }

    const catSlug = catByProject[slug] ?? slugify(diskCategory);

    const refs = parseRefs(lines);
    const chapterBlocks = parseChapters(lines);
    const narrative = buildNarrative(text, lines, refs);

    const existingPath = path.join(OUT_DIR, catSlug, `${slug}.json`);
    let existing = {};
    if (existsSync(existingPath)) {
      existing = JSON.parse(readFileSync(existingPath, "utf8"));
    }

    if (!existing.visualChapters) existing.visualChapters = [];
    if (!existing.favoriteImages) existing.favoriteImages = [];
    if (!existing.featuredImages) existing.featuredImages = [];

    const merged = {
      ...existing,
      projectTitle: existing.projectTitle || story.projectTitle,
      projectType: existing.projectType || story.projectType,
      location: existing.location || story.location,
      time: existing.time || story.time,
      camera: existing.camera || story.camera,
      lens: existing.lens || story.lens,
      coverImage: existing.coverImage || story.coverImage || `${slug}-1.jpg`,
      visualChapters: applyChapterStories(existing.visualChapters, chapterBlocks, refs),
      favoriteImages: existing.favoriteImages.map((fav) => {
        const ref = refs[normalizeFile((fav.file || "").toLowerCase())];
        if (!ref) return fav;
        return {
          ...fav,
          editorialTitle: ref.editorialTitle || fav.editorialTitle,
          description: ref.description || fav.description,
          role: ref.role || fav.role,
          ...(ref.storyConnection ? { storyConnection: ref.storyConnection } : {}),
        };
      }),
      sections: narrative.sections,
      ...(narrative.editingStory ? { editingStory: narrative.editingStory } : {}),
      ...(narrative.conclusion ? { conclusion: narrative.conclusion } : {}),
    };

    const outFile = path.join(OUT_DIR, catSlug, `${slug}.json`);
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, JSON.stringify(merged, null, 2));
    emitted.push({ catSlug, slug, title: merged.projectTitle });
    console.log(
      `  -> ${catSlug}/${slug}.json (${merged.sections.length} sections, ${merged.visualChapters.length} chapters)`,
    );
  }

  if (skipped.length) console.log(`Skipped (no narrative): ${skipped.join(", ")}`);

  // Clean up story JSONs for projects that no longer have an author narrative.
  const keep = new Set(emitted.map((e) => `${e.catSlug}/${e.slug}`));
  const cats = await readdir(OUT_DIR, { withFileTypes: true });
  for (const cat of cats) {
    if (!cat.isDirectory()) continue;
    const projectFiles = await readdir(path.join(OUT_DIR, cat.name));
    for (const pf of projectFiles) {
      if (!pf.endsWith(".json")) continue;
      const key = `${cat.name}/${pf.replace(/\.json$/, "")}`;
      if (!keep.has(key)) {
        const delPath = path.join(OUT_DIR, cat.name, pf);
        await rm(delPath, { force: true });
        console.log(`Removed stale: ${key}`);
      }
    }
  }

  // Regenerate the index from emitted stories only.
  const index = {};
  for (const e of emitted) {
    index[`${e.catSlug}/${e.slug}`] = {
      category: e.catSlug,
      project: e.slug,
      title: e.title,
      hasStory: true,
    };
  }
  await writeFile(path.join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2));
  console.log(`Story index written (${Object.keys(index).length} stories)`);
}

main().catch(console.error);