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
  type StoryImage,
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
  images: { src?: string }[];
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

type Block =
  | { type: "single"; image: ResolvedImage; width: "widest" | "wide" | "narrow" | "detail" }
  | { type: "two-up"; a: ResolvedImage; b: ResolvedImage }
  | { type: "offset"; a: ResolvedImage; b: ResolvedImage }
  | { type: "detail-pair"; a: ResolvedImage; b: ResolvedImage };

function resolve(image: StoryImage, images: { src?: string }[], overrides?: { layout?: EditorialLayout }): ResolvedImage {
  return {
    src: srcFor(image.file, images),
    editorialTitle: image.editorialTitle,
    description: image.description,
    note: image.note,
    storyConnection: image.storyConnection,
    layout: overrides?.layout ?? image.layout ?? "large",
  };
}

function blocksForChapter(chapter: StoryChapter, images: { src?: string }[], chapterIndex: number): Block[] {
  const blocks: Block[] = [];
  const imgs = chapter.images;
  let i = 0;

  while (i < imgs.length) {
    const img = imgs[i];

    if (img.layout === "detail") {
      blocks.push({ type: "single", image: resolve(img, images, { layout: "detail" }), width: "detail" });
      i += 1;
      continue;
    }
    if (img.layout === "two-up" || img.layout === "offset") {
      const next = i + 1 < imgs.length ? imgs[i + 1] : null;
      if (next) {
        blocks.push(
          img.layout === "two-up"
            ? { type: "two-up", a: resolve(img, images, { layout: "two-up" }), b: resolve(next, images, { layout: "two-up" }) }
            : { type: "offset", a: resolve(img, images, { layout: "offset" }), b: resolve(next, images, { layout: "offset" }) },
        );
        i += 2;
      } else {
        blocks.push({ type: "single", image: resolve(img, images, { layout: "large" }), width: "wide" });
        i += 1;
      }
      continue;
    }
    if (img.layout === "full" || img.layout === "medium" || img.layout === "large") {
      const width = img.layout === "full" ? "widest" : img.layout === "medium" ? "narrow" : "wide";
      blocks.push({ type: "single", image: resolve(img, images, { layout: img.layout }), width });
      i += 1;
      continue;
    }

    if (img.role === "detail") {
      const next = i + 1 < imgs.length && imgs[i + 1].role === "detail" && !imgs[i + 1].layout ? imgs[i + 1] : null;
      if (next) {
        blocks.push({
          type: "detail-pair",
          a: resolve(img, images, { layout: "detail" }),
          b: resolve(next, images, { layout: "detail" }),
        });
        i += 2;
      } else {
        blocks.push({ type: "single", image: resolve(img, images, { layout: "detail" }), width: "detail" });
        i += 1;
      }
      continue;
    }

    if (i === 0 && chapterIndex === 0) {
      blocks.push({ type: "single", image: resolve(img, images, { layout: "large" }), width: "wide" });
      i += 1;
      continue;
    }

    const next = i + 1 < imgs.length ? imgs[i + 1] : null;
    if (next && next.role !== "detail" && !next.layout) {
      const useOffset = blocks.length % 3 === 1;
      blocks.push(
        useOffset
          ? { type: "offset", a: resolve(img, images, { layout: "offset" }), b: resolve(next, images, { layout: "offset" }) }
          : { type: "two-up", a: resolve(img, images, { layout: "two-up" }), b: resolve(next, images, { layout: "two-up" }) },
      );
      i += 2;
    } else {
      blocks.push({ type: "single", image: resolve(img, images, { layout: "full" }), width: "widest" });
      i += 1;
    }
  }

  return blocks;
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

function Figure({ image, eager, className, camera, ratio }: { image: ResolvedImage; eager?: boolean; className?: string; camera?: string; ratio?: number }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-sm">
        <Photo
          src={image.src}
          alt={image.editorialTitle}
          eager={eager}
          ratio={ratio}
          sizes="(max-width: 1280px) 100vw, 1024px"
          className="transition-transform duration-700 hover:scale-[1.01]"
        />
      </div>
      <Caption title={image.editorialTitle} src={image.src} camera={camera} />
    </figure>
  );
}

function ChapterBlocks({ chapter, images, chapterIndex, camera }: { chapter: StoryChapter; images: { src?: string }[]; chapterIndex: number; camera?: string }) {
  const blocks = blocksForChapter(chapter, images, chapterIndex);

  return (
    <div className="space-y-14 md:space-y-20">
      {blocks.map((block, i) => {
        if (block.type === "two-up") {
          return (
            <Reveal key={`${chapter.id}-${i}`} delay={i * 0.05}>
              <div className="grid gap-10 sm:grid-cols-2 sm:items-start sm:gap-8">
                <Figure image={block.a} eager={chapterIndex === 0 && i === 0} camera={camera} />
                <Figure image={block.b} camera={camera} />
              </div>
            </Reveal>
          );
        }
        if (block.type === "offset") {
          return (
            <Reveal key={`${chapter.id}-${i}`} delay={i * 0.05}>
              <div className="grid gap-10 sm:grid-cols-12 sm:items-start sm:gap-8">
                <Figure image={block.a} eager={chapterIndex === 0 && i === 0} className="sm:col-span-7" camera={camera} />
                <Figure image={block.b} className="sm:col-span-5" camera={camera} />
              </div>
            </Reveal>
          );
        }
        if (block.type === "detail-pair") {
          return (
            <Reveal key={`${chapter.id}-${i}`} delay={i * 0.05}>
              <div className="mx-auto grid max-w-3xl gap-10 sm:grid-cols-2 sm:items-start sm:gap-8">
                <Figure image={block.a} camera={camera} />
                <Figure image={block.b} camera={camera} />
              </div>
            </Reveal>
          );
        }
        const width =
          block.width === "detail"
            ? "mx-auto max-w-md"
            : block.width === "narrow"
              ? "mx-auto max-w-2xl"
              : block.width === "wide"
                ? "mx-auto max-w-4xl"
                : "mx-auto max-w-5xl";
        return (
          <Reveal key={`${chapter.id}-${i}`} delay={i * 0.05} className={width}>
            <Figure image={block.image} eager={chapterIndex === 0 && i === 0} camera={camera} />
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
    <figure className={cn("mx-auto", isPortrait ? "max-w-2xl" : "max-w-4xl")}>
      <div className="overflow-hidden rounded-sm bg-surface">
        <Photo src={src} alt={title ?? ""} fit="contain" sizes="(max-width: 1280px) 100vw, 1024px" />
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
  skipFiles,
}: {
  sections: StorySection[];
  images: { src?: string }[];
  camera?: string;
  context: Array<{ file: string; editorialTitle?: string; description?: string }>;
  patterns: string[];
  pullQuote?: string;
  pullQuoteAfter?: number;
  skipFiles?: Set<string>;
}) {
  return (
    <div className="space-y-14 md:space-y-20">
      {sections
        .filter((s) => s.text.trim())
        .map((section, i) => {
          const pinnedSrc = section.image ? srcFor(section.image, images) : "";
          const pinnedVisible = Boolean(pinnedSrc) && !(skipFiles?.has(fileBase(pinnedSrc)));
          const pinned = section.image ? findImageContext(section.image, context) : undefined;
          return (
            <div key={i} className="space-y-12 md:space-y-16">
              <Reveal>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed whitespace-pre-wrap text-justify text-pretty text-ink/85 md:text-xl">
                  <Highlight text={section.text} patterns={patterns} />
                </p>
              </Reveal>
              {pinnedVisible && (
                <Reveal delay={0.05}>
                  <StoryFigure src={pinnedSrc} title={pinned?.editorialTitle} camera={camera} />
                </Reveal>
              )}
              {section.related?.map((r, j) => {
                const relatedSrc = srcFor(r.file, images);
                if (!relatedSrc || skipFiles?.has(fileBase(relatedSrc))) return null;
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

  // Each image appears exactly once on the page. The visual chapters are the
  // canonical home for every image they reference; the hero renders its own
  // cover. Story figures (pinned + related) only render images that are shown
  // nowhere else, so a photo never repeats lower down the page.
  const coverKey = fileBase(story.coverImage);
  const chapterFileBases = new Set<string>();
  for (const ch of story.visualChapters ?? []) for (const img of ch.images ?? []) chapterFileBases.add(fileBase(img.file));
  const skipStoryFiles = new Set<string>([coverKey, ...chapterFileBases]);

  // Drop the hero cover from a chapter only when the chapter still has other
  // images to show; a single-image chapter keeps its image.
  const chapters = (story.visualChapters ?? []).map((ch) => {
    if (ch.images.length === 1) return ch;
    const images = ch.images.filter((img) => fileBase(img.file) !== coverKey);
    return images.length > 0 ? { ...ch, images } : ch;
  });

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
    ...new Set(imageContext.map((c) => c.editorialTitle).filter((t): t is string => Boolean(t && t.trim()))),
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
  const pullQuoteAfter = pullQuote ? Math.floor(storySections.length / 2) : -1;

  // Surface the first paragraphs, then let the reader continue the story.
  const PREVIEW_SECTIONS = 2;
  const previewSections = storySections.slice(0, PREVIEW_SECTIONS);
  const restSections = storySections.slice(PREVIEW_SECTIONS);
  const storyNodes = {
    preview: (
      <StorySections
        sections={previewSections}
        images={images}
        camera={story.camera}
        context={imageContext}
        patterns={highlightPatterns}
        pullQuote={pullQuoteAfter < PREVIEW_SECTIONS ? pullQuote : undefined}
        pullQuoteAfter={pullQuoteAfter < PREVIEW_SECTIONS ? pullQuoteAfter : -1}
        skipFiles={skipStoryFiles}
      />
    ),
    rest: (
      <StorySections
        sections={restSections}
        images={images}
        camera={story.camera}
        context={imageContext}
        patterns={highlightPatterns}
        pullQuote={pullQuoteAfter >= PREVIEW_SECTIONS ? pullQuote : undefined}
        pullQuoteAfter={pullQuoteAfter >= PREVIEW_SECTIONS ? pullQuoteAfter - PREVIEW_SECTIONS : -1}
        skipFiles={skipStoryFiles}
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
                  <Photo src={heroSrc} alt={story.projectTitle} eager fit="contain" sizes="(max-width: 1280px) 70vw, 720px" />
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
              <Photo src={heroSrc} alt={story.projectTitle} eager fit="contain" sizes="(max-width: 1280px) 90vw, 1024px" />
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
          <SectionLabel>Visual Chapters</SectionLabel>
          {chapters.map((chapter, i) => (
            <div key={chapter.id} className={cn("space-y-14 md:space-y-20", i > 0 && "mt-24 md:mt-32")}>
              <ChapterHeader chapter={chapter} index={i} />
              <ChapterBlocks chapter={chapter} images={images} chapterIndex={i} camera={story.camera} />
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