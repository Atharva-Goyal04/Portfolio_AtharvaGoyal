import { fileURLToPath } from "node:url";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const OUT_DIR = path.join(ROOT, "src", "data", "stories");

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseRTF(rtf) {
  // Basic RTF to plain text conversion
  let text = rtf
    .replace(/\\[a-z]+\d*\s?/gi, " ")
    .replace(/[{}]/g, "")
    .replace(/\\'/g, "'")
    .replace(/\\~/g, " ")
    .replace(/\\_/g, " ")
    .replace(/\\-/g, " ")
    .replace(/\\\(/g, " ")
    .replace(/\\par|\\pard|\\line|\\tab/gi, "\n")
    .replace(/\\cf\d+|\\strokec\d+|\\expndtw\d+|\\expnd\d+|\\kerning\d+|\\f\d+|\\fs\d+|\\b0?|\\i0?|\\ul|\\ulc\d+|\\outl\d+|\\strokewidth\d+|\\li\d+|\\fi-\d+|\\sa\d+|\\partightenfactor\d+|\\tx\d+|\\ls\d+|\\ilvl\d+|\\listtext|\\'[0-9a-f]{2}|\\uc\d+|\\u\d+|\\kerning\d+/gi, "")
    .replace(/\\[a-z]+/gi, " ")
    .replace(/\\/g, "")
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  return text;
}

function extractSection(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return null;
  const end = endMarker ? text.indexOf(endMarker, start) : text.length;
  return text.slice(start + startMarker.length, end).trim();
}

async function parseStoryFile(rtfPath) {
  const raw = await readFile(rtfPath, "utf8");
  const text = parseRTF(raw);

  const story = {
    projectTitle: "",
    projectType: "",
    location: "",
    time: "",
    camera: "",
    lens: "",
    coverImage: "",
    visualChapters: [],
    favoriteImages: [],
    featuredImages: [],
    closingStory: "",
    metadata: {},
    imageReferences: [],
    instagramRefs: [],
    websitePresentation: "",
    implementationNotes: "",
  };

  // Project title
  const titleMatch = text.match(/PROJECT:\s*([^\n]+)/i);
  if (titleMatch) story.projectTitle = titleMatch[1].trim();

  // Project type
  const typeMatch = text.match(/Project type:\s*([^\n]+)/i);
  if (typeMatch) story.projectType = typeMatch[1].trim();

  // Location
  const locMatch = text.match(/Location:\s*([^\n]+)/i);
  if (locMatch) story.location = locMatch[1].trim();

  // Time
  const timeMatch = text.match(/(?:Time|Time period|Occasion):\s*([^\n]+)/i);
  if (timeMatch) story.time = timeMatch[1].trim();

  // Camera
  const camMatch = text.match(/Camera[^:]*:(.*?)(?:\n\n|\n[A-Z])/is);
  if (camMatch) story.camera = camMatch[1].trim();

  // Lens
  const lensMatch = text.match(/Lens[^:]*:(.*?)(?:\n\n|\n[A-Z])/is);
  if (lensMatch) story.lens = lensMatch[1].trim();

  // Cover image
  const coverMatch = text.match(/Cover image:\s*([^\n]+)/i);
  if (coverMatch) story.coverImage = coverMatch[1].trim();

  // Visual chapters / sections
  const chapterRegex = /(?:VISUAL CHAPTERS?|VISUAL DIRECTIONS?|Show|Blue|Red|Clean Studio|Monotone|Shutter Drag|Show \/ Blueprint|Blue \/ Fountain of Youth|Red \/ Heatwave)[^:]*:([\s\S]*?)(?=\n[A-Z]{2,}|\nVISUAL|\nFAVORITE|\nFEATURED|\nCLOSING|\nPROJECT|\nEXTERNAL|\nWEBSITE|\nIMAGE|\nINSTAGRAM|$)/gi;
  let match;
  while ((match = chapterRegex.exec(text)) !== null) {
    const chapterText = match[1].trim();
    if (chapterText) {
      const titleMatch = chapterText.match(/^([^\n]+)/);
      story.visualChapters.push({
        title: titleMatch ? titleMatch[1].trim() : "Chapter",
        content: chapterText,
      });
    }
  }

  // Favorite images
  const favRegex = /FAVORITE IMAGE[^:]*:([\s\S]*?)(?=\n[A-Z]{2,}|\nFEATURED|\nCLOSING|\nPROJECT|\nEXTERNAL|\nWEBSITE|\nIMAGE|\nINSTAGRAM|$)/gi;
  while ((match = favRegex.exec(text)) !== null) {
    story.favoriteImages.push(match[1].trim());
  }

  // Featured images
  const featRegex = /FEATURED IMAGE[^:]*:([\s\S]*?)(?=\n[A-Z]{2,}|\nFAVORITE|\nCLOSING|\nPROJECT|\nEXTERNAL|\nWEBSITE|\nIMAGE|\nINSTAGRAM|$)/gi;
  while ((match = featRegex.exec(text)) !== null) {
    story.featuredImages.push(match[1].trim());
  }

  // Closing story
  const closingMatch = text.match(/CLOSING STORY[^:]*:([\s\S]*?)(?=\n[A-Z]{2,}|\nPROJECT|\nEXTERNAL|\nWEBSITE|\nIMAGE|\nINSTAGRAM|$)/i);
  if (closingMatch) story.closingStory = closingMatch[1].trim();

  // Website presentation
  const wpMatch = text.match(/WEBSITE PRESENTATION[^:]*:([\s\S]*?)(?=\n[A-Z]{2,}|\nIMAGE|\nEXTERNAL|\nINSTAGRAM|$)/i);
  if (wpMatch) story.websitePresentation = wpMatch[1].trim();

  // Implementation notes
  const implMatch = text.match(/IMPLEMENTATION NOTES[^:]*:([\s\S]*?)(?=\n[A-Z]{2,}|$)/i);
  if (implMatch) story.implementationNotes = implMatch[1].trim();

  // Image references
  const imgRefRegex = /(?:Image References|IMAGE REFERENCES)[\s\S]*?(?:File:\s*([^\n]+)[\s\S]*?Title:\s*([^\n]+)[\s\S]*?Description:\s*([^\n]+)[\s\S]*?Story connection:\s*([^\n]+)[\s\S]*?(?:Importance:\s*([^\n]+))?)/gi;
  while ((match = imgRefRegex.exec(text)) !== null) {
    story.imageReferences.push({
      file: match[1]?.trim(),
      title: match[2]?.trim(),
      description: match[3]?.trim(),
      storyConnection: match[4]?.trim(),
      importance: match[5]?.trim(),
    });
  }

  // Instagram refs
  const igRegex = /https?:\/\/www\.instagram\.com\/p\/[^\s]+/g;
  const igMatches = text.match(igRegex);
  if (igMatches) story.instagramRefs = igMatches;

  return story;
}

async function findStoryFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findStoryFiles(fullPath));
    } else if (entry.name.toLowerCase().endsWith(".rtf") || entry.name.toLowerCase().endsWith(".txt") || entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const storyFiles = await findStoryFiles(IMAGES_DIR);
  console.log(`Found ${storyFiles.length} story files`);

  await mkdir(OUT_DIR, { recursive: true });

  for (const file of storyFiles) {
    const relPath = path.relative(IMAGES_DIR, file);
    const category = relPath.split(path.sep)[0];
    const project = relPath.split(path.sep).slice(1, -1).join("/") || category;
    const slug = slugify(project);
    const catSlug = slugify(category);

    console.log(`Parsing: ${category}/${project}`);
    const story = await parseStoryFile(file);
    story.category = category;
    story.project = project;
    story.slug = slug;
    story.categorySlug = catSlug;

    // Add default cover if not specified
    if (!story.coverImage) {
      story.coverImage = `${slug}-1.jpg`; // fallback
    }

    const outFile = path.join(OUT_DIR, catSlug, `${slug}.json`);
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, JSON.stringify(story, null, 2));
    console.log(`  -> ${outFile}`);
  }

  // Also generate an index
  const index = {};
  for (const file of storyFiles) {
    const relPath = path.relative(IMAGES_DIR, file);
    const category = relPath.split(path.sep)[0];
    const project = relPath.split(path.sep).slice(1, -1).join("/") || category;
    const slug = slugify(project);
    const catSlug = slugify(category);
    index[`${catSlug}/${slug}`] = {
      category: catSlug,
      project: slug,
      title: "",
      hasStory: true,
    };
  }
  await writeFile(path.join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2));
  console.log("Story index written");
}

main().catch(console.error);