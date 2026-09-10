import Link from "next/link";
import { Fragment } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import Photo from "@/components/shared/photo";
import Reveal from "@/components/shared/reveal";
import ContinueReading from "@/components/portfolio/continue-reading";
import { imageInfo } from "@/lib/images";
import { cn } from "@/lib/utils";
import {
  allProjects,
  type EditorialLayout,
  type ProjectStory,
  type StoryChapter,
  type StoryRelated,
  type StorySection,
} from "@/lib/projects";

// Normalize a filename (with or without path/extension) to its lowercase base
// so exact matching can never collide on substrings (e.g. `-1` vs `-10`).
function fileBase(file: string): string {
  return (file.split("/").pop() ?? file).replace(/\.[a-z0-9]+$/i, "").toLowerCase();
}

// Matches an image exactly by filename (case/path-insensitive) so a reference
// like `portrait-eclectic-1` can never resolve to `portrait-eclectic-10.jpg`.
function srcFor(file: string, images: { src?: string }[]): string {
  const want = fileBase(file);
  return images.find((img) => fileBase(img.src ?? "") === want)?.src ?? "";
}

interface ProjectEditorialProps {
  story: ProjectStory;
  images: Array<{ src?: string; projectTitle?: string }>;
  categoryLabel: string;
  category: string;
  slug: string;
}

interface ResolvedImage {
  src: string;
  editorialTitle: string;
  description: string;
  note?: string;
  storyConnection?: string;
  layout: EditorialLayout;
}

// Extracts the trailing number from an image filename so sets can be split by
// the actual shooting order (e.g. `portrait-nikon_shoot-12` → 12,
// `portrait-eclectic-1-color` → 1).
function numericSuffix(file: string): number {
  const base = (file.split("/").pop() ?? file).replace(/\.[a-z0-9]+$/i, "");
  const m = base.match(/-(\d+)(?:-[a-z0-9]+)?$/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

// Splits image srcs into `n` consecutive numeric-order ranges. A project with
// 15 files and 3 chapters yields clean 1–5 / 6–10 / 11–15 chunks.
function splitIntoRanges(srcs: string[], n: number): string[][] {
  const sorted = [...srcs].sort((a, b) => numericSuffix(a) - numericSuffix(b));
  const chunks: string[][] = [];
  for (let i = 0; i < n; i++) {
    const start = Math.round((i * sorted.length) / n);
    const end = Math.round(((i + 1) * sorted.length) / n);
    chunks.push(sorted.slice(start, end));
  }
  return chunks;
}

// Extracts the labeling tag after the number, e.g. `portrait-eclectic-1-color` → "color".
// Files with no tag (bare numbers) are black-and-white by convention.
function filenameTag(file: string): string {
  const base = (file.split("/").pop() ?? file).replace(/\.[a-z0-9]+$/i, "");
  const m = base.match(/-(\d+)-([a-z0-9]+)$/i);
  return m ? m[2].toLowerCase() : "";
}

// When a project labels its photos (e.g. `…-1-color` for color, bare numbers for
// bnw), chapters follow those tag groups instead of numeric ranges. Returns null
// when the project has no tags, falling back to splitIntoRanges.
function chapterSetsFor(srcs: string[], chapters: { title: string }[]): string[][] | null {
  const byTag = new Map<string, string[]>();
  const untagged: string[] = [];
  for (const src of srcs) {
    const tag = filenameTag(src);
    if (tag) {
      byTag.set(tag, [...(byTag.get(tag) ?? []), src]);
    } else {
      untagged.push(src);
    }
  }
  if (byTag.size + (untagged.length ? 1 : 0) !== chapters.length) return null;

  const sortGroup = (g: string[]) => [...g].sort((a, b) => numericSuffix(a) - numericSuffix(b));
  const sets: (string[] | null)[] = chapters.map(() => null);
  const matched = new Set<string>();

  for (let i = 0; i < chapters.length; i++) {
    const tag = [...byTag.keys()].find((t) => chapters[i].title.toLowerCase().includes(t));
    if (tag && !matched.has(tag)) {
      sets[i] = sortGroup(byTag.get(tag)!);
      matched.add(tag);
    }
  }

  const open = sets.map((s, i) => (s ? -1 : i)).filter((i) => i >= 0);

  if (untagged.length) {
    if (open.length !== 1) return null;
    sets[open[0]] = sortGroup(untagged);
    return sets as string[][];
  }

  const leftTags = [...byTag.keys()]
    .filter((t) => !matched.has(t))
    .sort((a, b) => numericSuffix(byTag.get(a)![0]) - numericSuffix(byTag.get(b)![0]));
  if (leftTags.length !== open.length) return null;
  for (let j = 0; j < open.length; j++) sets[open[j]] = sortGroup(byTag.get(leftTags[j])!);
  return sets as string[][];
}

function Caption({ title, src, camera }: { title?: string; src?: string; camera?: string }) {
  return (
    <div className="mt-4 max-w-lg">
      {title && <h3 className="font-display text-lg font-medium tracking-tight text-ink">{title}</h3>}
      {src && <ExifLine src={src} camera={camera} />}
    </div>
  );
}

function ExifLine({ src, camera }: { src: string; camera?: string }) {
  const info = imageInfo(src);
  if (!info) return null;
  const parts: string[] = [];
  if (info.shutterSpeed) parts.push(info.shutterSpeed);
  if (info.aperture) parts.push(info.aperture);
  if (info.iso && info.iso !== "0" && info.iso !== "150") parts.push(`ISO ${info.iso}`);
  if (info.focalLength) parts.push(info.focalLength);
  if (info.lens && info.lens !== "Not specified") parts.push(info.lens);
  if (info.camera && info.camera !== camera) parts.push(info.camera);
  if (parts.length === 0) return null;
  return (
    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/60">
      {parts.join(" · ")}
    </p>
  );
}

function Figure({
  image,
  eager,
  className,
  camera,
  ratio,
  sizes = "(max-width: 1280px) 100vw, 1024px",
}: {
  image: ResolvedImage;
  eager?: boolean;
  className?: string;
  camera?: string;
  ratio?: number;
  sizes?: string;
}) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-sm">
        <Photo
          src={image.src}
          alt={image.editorialTitle}
          eager={eager}
          ratio={ratio}
          sizes={sizes}
          className="transition-transform duration-700 hover:scale-[1.01]"
        />
      </div>
      <Caption title={image.editorialTitle} src={image.src} camera={camera} />
    </figure>
  );
}

// Renders a chapter's full set as a tidy editorial grid — small and consistent
// (no full-bleed singles), each figure capped at a caption + EXIF line.
function SetGrid({
  chapter,
  images,
  eagerFirst,
  camera,
}: {
  chapter: StoryChapter;
  images: { src?: string }[];
  eagerFirst?: boolean;
  camera?: string;
}) {
  return (
    <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {chapter.images.map((img, i) => {
        const src = srcFor(img.file, images);
        if (!src) return null;
        const info = imageInfo(src);
        const isLandscape = info ? info.width > info.height : false;
        return (
          <Reveal
            key={`${chapter.id}-${i}`}
            delay={i * 0.04}
            className={isLandscape ? "sm:col-span-2 lg:col-span-2" : undefined}
          >
            <Figure
              image={{
                src,
                editorialTitle: img.editorialTitle,
                description: img.description,
                note: img.note,
                storyConnection: img.storyConnection,
                layout: "large",
              }}
              eager={eagerFirst && i === 0}
              camera={camera}
              sizes={
                isLandscape
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 45vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
            />
          </Reveal>
        );
      })}
    </div>
  );
}

function ChapterHeader({ chapter, index }: { chapter: StoryChapter; index: number }) {
  return (
    <header className="mb-12 md:mb-16">
      <div className="flex items-center gap-4">
        <span className="h-px w-10 bg-brand/60" />
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
          {chapter.title ? `${chapter.title} · 0${index + 1}` : `Chapter 0${index + 1}`}
        </span>
      </div>
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-balance text-ink md:text-4xl">
        {chapter.subtitle ?? chapter.title}
      </h2>
      {chapter.description && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-pretty">{chapter.description}</p>
      )}
    </header>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10 flex items-center gap-4 md:mb-12">
      <span className="h-px w-10 bg-brand/60" />
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">{children}</span>
    </div>
  );
}

function StoryFigure({ src, title, camera }: { src: string; title?: string; camera?: string }) {
  const info = imageInfo(src);
  const isPortrait = info ? info.height > info.width : false;
  return (
    <figure className={cn("mx-auto", isPortrait ? "max-w-md" : "max-w-lg")}>
      <div className="overflow-hidden rounded-sm bg-surface">
        <Photo
          src={src}
          alt={title ?? ""}
          fit="contain"
          imgClassName="block h-auto w-full"
          sizes="(max-width: 1280px) 100vw, 640px"
        />
      </div>
      <Caption title={title} src={src} camera={camera} />
    </figure>
  );
}

function RelatedFigure({ related, images, camera }: { related: StoryRelated; images: { src?: string }[]; camera?: string }) {
  const src = srcFor(related.file, images);
  if (!src) return null;
  return <StoryFigure src={src} title={related.title} camera={camera} />;
}

const sentenceRe = /[^.!?]+[.!?]+/g;

// For long stories, surface a single verbatim sentence from the middle as a
// pull quote — the photographer's own words, never altered or invented.
function pullQuoteFor(sections: StorySection[]): string | undefined {
  const long = sections.filter((s) => s.text.trim().length > 0);
  if (long.length < 6) return undefined;
  const middle = long[Math.floor(long.length / 2)].text;
  const sentences = middle.match(sentenceRe);
  if (!sentences) return undefined;
  const pick = sentences.filter((s) => s.trim().split(/\s+/).length >= 5 && s.trim().split(/\s+/).length <= 35);
  if (pick.length === 0) return undefined;
  return pick.sort((a, b) => b.trim().split(/\s+/).length - a.trim().split(/\s+/).length)[0].trim();
}

function PullQuote({ quote }: { quote: string }) {
  return (
    <Reveal>
      <div className="flex gap-5 py-6 md:gap-7">
        <span className="w-px shrink-0 bg-brand/60" />
        <blockquote className="font-display text-2xl font-medium leading-snug text-balance text-ink md:text-3xl">
          “{quote}”
        </blockquote>
      </div>
    </Reveal>
  );
}

function StorySections({
  sections,
  images,
  camera,
  context,
  patterns,
  pullQuote,
  pullQuoteAfter,
}: {
  sections: StorySection[];
  images: { src?: string }[];
  camera?: string;
  context: Array<{ file: string; editorialTitle?: string; description?: string }>;
  patterns: string[];
  pullQuote?: string;
  pullQuoteAfter?: number;
}) {
  return (
    <div className="space-y-14 md:space-y-20">
      {sections
        .filter((s) => s.text.trim())
        .map((section, i) => {
          const pinnedSrc = section.image ? srcFor(section.image, images) : "";
          const pinned = section.image ? findImageContext(section.image, context) : undefined;
          return (
            <div key={i} className="space-y-12 md:space-y-16">
              <Reveal>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed whitespace-pre-wrap text-justify text-pretty text-ink/85 md:text-xl">
                  <Highlight text={section.text} patterns={patterns} />
                </p>
              </Reveal>
              {pinnedSrc && (
                <Reveal delay={0.05}>
                  <StoryFigure src={pinnedSrc} title={pinned?.editorialTitle} camera={camera} />
                </Reveal>
              )}
              {section.related?.map((r, j) => {
                const relatedSrc = srcFor(r.file, images);
                if (!relatedSrc) return null;
                return (
                  <Reveal key={j} delay={0.08}>
                    <RelatedFigure related={r} images={images} camera={camera} />
                  </Reveal>
                );
              })}
              {pullQuote && i === pullQuoteAfter && <PullQuote quote={pullQuote} />}
            </div>
          );
        })}
    </div>
  );
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Paints editorial titles + referenced image filenames in the golden brand color.
function Highlight({ text, patterns }: { text: string; patterns: string[] }) {
  if (!text || patterns.length === 0) return <>{text}</>;
  const re = new RegExp(`\\b(?:${patterns.map(escapeRegExp).join("|")})\\b`, "g");
  const parts = text.split(re);
  const matches = text.match(re);
  if (!matches || matches.length === 0) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < matches.length && (
            <mark className="rounded-sm bg-transparent px-0.5 font-medium text-brand">
              {matches[i]}
            </mark>
          )}
        </Fragment>
      ))}
    </>
  );
}

// Find editorial title/description for a pinned story image across chapters + favorites.
function findImageContext(
  file: string,
  all: Array<{ file: string; editorialTitle?: string; description?: string }>,
): { editorialTitle?: string; description?: string } | undefined {
  const hit = all.find((img) => fileBase(img.file) === fileBase(file));
  if (!hit) return undefined;
  return { editorialTitle: hit.editorialTitle || undefined, description: hit.description || undefined };
}

const detailOrder: Array<[key: string, label: string]> = [
  ["projectType", "Type"],
  ["camera", "Camera"],
  ["cameraNote", "Camera Note"],
  ["lens", "Lens"],
  ["flash", "Lighting"],
  ["location", "Location"],
  ["time", "Season"],
];

export default function ProjectEditorial({ story, images, categoryLabel, category, slug }: ProjectEditorialProps) {
  const heroSrc = srcFor(story.coverImage, images) || images.find((img) => img.src)?.src || "";
  const heroInfo = imageInfo(heroSrc);
  const isPortraitHero = heroInfo ? heroInfo.height > heroInfo.width : false;

  const imageContext = [
    ...(story.visualChapters ?? []).flatMap((ch) => ch.images),
    ...(story.favoriteImages ?? []),
  ].map((img) => ({
    file: img.file,
    editorialTitle: img.editorialTitle,
    description: img.description,
  }));

  // Curated editorial titles/descriptions, keyed by canonical filename, so the
  // author's copy is reused wherever a photo already had one.
  const curatedMap = new Map(imageContext.map((c) => [fileBase(c.file), c]));

  // Every chapter presents its full shooting set — split by tag where photos are
  // labeled (e.g. Eclectic Art: `-color` files vs bare-number bnw), otherwise by
  // numeric order (e.g. Nikon Tour: clean 1–5 / mono 6–10 / drag 11–15).
  const curatedChapters = story.visualChapters ?? [];
  const allSrcs = images.map((img) => img.src).filter((s): s is string => Boolean(s));
  const tagSets = chapterSetsFor(allSrcs, curatedChapters);
  const rangeSets = splitIntoRanges(allSrcs, Math.max(curatedChapters.length, 1));
  const chapters: StoryChapter[] = curatedChapters.map((ch, i) => ({
    ...ch,
    images: (tagSets?.[i] ?? rangeSets[i] ?? []).map((src) => {
      const curated = curatedMap.get(fileBase(src));
      return {
        file: (src.split("/").pop() ?? src),
        editorialTitle: curated?.editorialTitle ?? "",
        description: curated?.description ?? "",
        role: "supporting",
      };
    }),
  }));

  // Every image file referenced in the story — any raw filename the author wrote
  // gets removed from the prose (files are reference, not story content).
  const storyFileBases = new Set<string>();
  const addBase = (f: string) => {
    const base = f.replace(/\.(jpe?g|png|heic|tiff|webp)$/i, "").toLowerCase();
    if (base) storyFileBases.add(base);
  };
  for (const s of story.sections ?? []) {
    if (s.image) addBase(s.image);
    for (const r of s.related ?? []) addBase(r.file);
  }
  for (const ch of story.visualChapters ?? []) for (const img of ch.images ?? []) addBase(img.file);
  for (const fav of story.favoriteImages ?? []) addBase(fav.file);

  const highlightPatterns = [
    ...new Set([
      ...imageContext.map((c) => c.editorialTitle).filter((t): t is string => Boolean(t && t.trim())),
      ...(story.highlights ?? []),
    ]),
  ].sort((a, b) => b.length - a.length);

  // Keep the author's prose untouched — no titles or reference data injected.
  // Only strip raw image filenames (gracefully keeping punctuation) and tidy
  // rtf spacing artifacts.
  const polishStory = (text: string) => {
    let out = text;
    for (const base of storyFileBases) {
      out = out
        .replace(new RegExp(`\\s+(?:is|was|by|of)\\s+${escapeRegExp(base)}\\s*`, "gi"), " ")
        .replace(new RegExp(`\\b${escapeRegExp(base)}(?:\\.(?:jpe?g|png|heic|tiff|webp))?\\b`, "gi"), "");
    }
    return out.replace(/\s+([.,!?])(?=\s|\s*$)/g, "$1").replace(/[ \t]{2,}/g, " ").trim();
  };

  const projects = allProjects();
  const others = projects.filter((p) => !(p.category === category && p.slug === slug));
  const sameCategory = others.filter((p) => p.category === category);
  const explore = [...sameCategory, ...others.filter((p) => p.category !== category)].slice(0, 3);

  const metaLine = [story.time, story.location].filter(Boolean).join(" · ");

  const detailRows: Array<[string, string]> = [];
  for (const [key, label] of detailOrder) {
    const value = story[key as keyof ProjectStory];
    if (typeof value === "string" && value && value !== "Not specified") detailRows.push([label, value]);
  }
  if (story.lightingSetup?.length) {
    detailRows.push(["Setup", story.lightingSetup.map((l) => `${l.role} — ${l.detail}`).join(" · ")]);
  }
  if (story.outfits && Object.keys(story.outfits).length) {
    detailRows.push([
      "Outfits",
      Object.entries(story.outfits).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" · "),
    ]);
  }

  const sections = (story.sections ?? []).map((s) => ({ ...s, text: polishStory(s.text) }));
  const editingStory = polishStory(story.editingStory ?? "");
  const conclusion = polishStory(story.conclusion ?? story.closingStory ?? "");

  const storySections = sections.filter((s) => s.text.trim());
  const pullQuote = pullQuoteFor(storySections);
  const pullQuoteIndex = pullQuote ? Math.floor(storySections.length / 2) : -1;

  // Surface the opening of the story — roughly 500 characters excluding spaces —
  // then let the reader continue. Whole sections are kept intact so prose stays verbatim.
  const PREVIEW_LIMIT = 500;
  const nonSpaceLen = (text: string) => text.replace(/\s+/g, "").length;
  let previewLen = 0;
  let previewCount = 0;
  for (const s of storySections) {
    previewLen += nonSpaceLen(s.text);
    previewCount += 1;
    if (previewLen >= PREVIEW_LIMIT) break;
  }
  const previewSections = storySections.slice(0, previewCount);
  const restSections = storySections.slice(previewCount);
  const quoteInPreview = pullQuoteIndex >= 0 && pullQuoteIndex < previewCount;
  const storyNodes = {
    preview: (
      <StorySections
        sections={previewSections}
        images={images}
        camera={story.camera}
        context={imageContext}
        patterns={highlightPatterns}
        pullQuote={quoteInPreview ? pullQuote : undefined}
        pullQuoteAfter={quoteInPreview ? pullQuoteIndex : -1}
      />
    ),
    rest: (
      <StorySections
        sections={restSections}
        images={images}
        camera={story.camera}
        context={imageContext}
        patterns={highlightPatterns}
        pullQuote={!quoteInPreview && pullQuoteIndex >= 0 ? pullQuote : undefined}
        pullQuoteAfter={!quoteInPreview && pullQuoteIndex >= 0 ? pullQuoteIndex - previewCount : -1}
      />
    ),
  };

  return (
    <article className="mx-auto w-full max-w-6xl px-6 pb-28 pt-24 md:pb-32 md:pt-28">
      <div className="mb-12 flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-brand"
        >
          <ChevronLeft className="h-4 w-4" /> Projects
        </Link>
      </div>

      <header>
        {isPortraitHero ? (
          <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-7">
              <Reveal>
                <figure className="overflow-hidden rounded-sm bg-surface">
                  <Photo
                    src={heroSrc}
                    alt={story.projectTitle}
                    eager
                    fit="contain"
                    imgClassName="block h-auto w-full"
                    sizes="(max-width: 1280px) 70vw, 720px"
                  />
                </figure>
              </Reveal>
            </div>
            <div className="md:col-span-5">
              <Reveal delay={0.08}>
                <div className="flex flex-col gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">{categoryLabel}</span>
                  <h1 className="font-display text-4xl font-medium tracking-tight text-balance text-ink md:text-5xl">
                    {story.projectTitle}
                  </h1>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted">{metaLine}</p>
                  {story.tagline && (
                    <p className="max-w-md text-base leading-relaxed text-muted text-pretty">{story.tagline}</p>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        ) : (
          <Reveal>
            <figure className="mx-auto w-full max-w-5xl overflow-hidden rounded-sm bg-surface">
              <Photo
                src={heroSrc}
                alt={story.projectTitle}
                eager
                fit="contain"
                imgClassName="block h-auto w-full"
                sizes="(max-width: 1280px) 90vw, 1024px"
              />
            </figure>
            <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">{categoryLabel}</span>
              <h1 className="font-display text-4xl font-medium tracking-tight text-balance text-ink md:text-6xl">
                {story.projectTitle}
              </h1>
              <p className="font-mono text-xs uppercase tracking-wider text-muted">{metaLine}</p>
              {story.tagline && (
                <p className="mt-1 max-w-xl text-base leading-relaxed text-muted text-pretty">{story.tagline}</p>
              )}
            </div>
          </Reveal>
        )}
      </header>

      {sections.length > 0 && (
        <section className="mx-auto mt-20 max-w-4xl md:mt-28">
          <Reveal>
            <div className="mb-10 flex items-center gap-4 md:mb-14">
              <span className="h-px w-10 bg-brand/60" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">The Story</span>
            </div>
          </Reveal>
          {restSections.length > 0 ? (
            <ContinueReading preview={storyNodes.preview}>{storyNodes.rest}</ContinueReading>
          ) : (
            storyNodes.preview
          )}
        </section>
      )}

      {chapters.length > 0 && (
        <section className="mt-24 md:mt-32">
          <SectionLabel>Complete Collection</SectionLabel>
          {chapters.map((chapter, i) => (
            <div key={chapter.id} className={cn("space-y-14 md:space-y-20", i > 0 && "mt-24 md:mt-32")}>
              <ChapterHeader chapter={chapter} index={i} />
              <SetGrid chapter={chapter} images={images} eagerFirst={i === 0} camera={story.camera} />
            </div>
          ))}
        </section>
      )}

      {editingStory && (
        <section className="mx-auto mt-24 max-w-2xl md:mt-32">
          <Reveal>
            <SectionLabel>Editing</SectionLabel>
            <p className="font-display text-xl leading-relaxed whitespace-pre-wrap text-justify text-pretty text-ink/85 md:text-2xl">
              <Highlight text={editingStory} patterns={highlightPatterns} />
            </p>
          </Reveal>
        </section>
      )}

      {conclusion && (
        <section className="mx-auto mt-24 max-w-2xl md:mt-32">
          <Reveal>
            <SectionLabel>Looking Back</SectionLabel>
            <p className="text-lg leading-relaxed whitespace-pre-wrap text-justify text-pretty text-muted md:text-xl">
              <Highlight text={conclusion} patterns={highlightPatterns} />
            </p>
          </Reveal>
        </section>
      )}

      {detailRows.length > 0 && (
        <section className="mx-auto mt-24 max-w-2xl md:mt-32">
          <div className="border-t border-line pt-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Project Details</span>
            <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {detailRows.map(([label, value]) => (
                <div key={label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted/70">{label}</dt>
                  <dd className="mt-1.5 font-display text-base leading-snug text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {explore.length > 0 && (
        <section className="mt-24 md:mt-32">
          <div className="mb-10 border-t border-line pt-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Explore Other Projects</span>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {explore.map((proj, i) => (
              <Link
                key={`${proj.category}/${proj.slug}`}
                href={`/projects/${proj.category}/${proj.slug}`}
                className="group block"
              >
                <Reveal delay={i * 0.06}>
                  <figure>
                    <div className="overflow-hidden rounded-sm bg-surface">
                      <Photo
                        src={proj.coverSrc || proj.cover}
                        alt={proj.title}
                        ratio={4 / 5}
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px"
                        className="transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    </div>
                    <figcaption className="mt-4 flex items-end justify-between gap-4">
                      <span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted/70">
                          {proj.categoryLabel}
                        </span>
                        <span className="mt-1 block font-display text-lg font-medium tracking-tight text-ink">
                          {proj.title}
                        </span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-brand">
                        View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}