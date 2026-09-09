import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";
import Photo from "@/components/shared/photo";
import Reveal from "@/components/shared/reveal";
import { cn } from "@/lib/utils";
import {
  allProjects,
  getImagesForProject,
  getProjectStory,
  type EditorialLayout,
  type ProjectStory,
  type StoryChapter,
  type StoryImage,
} from "@/lib/projects";

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
  layout: EditorialLayout;
}

type Block =
  | { type: "single"; image: ResolvedImage; width: "widest" | "wide" | "narrow" | "detail" }
  | { type: "two-up"; a: ResolvedImage; b: ResolvedImage }
  | { type: "offset"; a: ResolvedImage; b: ResolvedImage }
  | { type: "detail-pair"; a: ResolvedImage; b: ResolvedImage };

function srcFor(file: string, images: { src?: string }[]): string {
  const found = images.find((img) => img.src?.includes(file));
  return found?.src ?? "";
}

function resolve(image: StoryImage, images: { src?: string }[], overrides?: { layout?: EditorialLayout }): ResolvedImage {
  return {
    src: srcFor(image.file, images),
    editorialTitle: image.editorialTitle,
    description: image.description,
    note: image.note,
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

function Caption({ title, description, note }: { title: string; description: string; note?: string }) {
  return (
    <div className="mt-4 max-w-lg">
      {title && <h3 className="font-display text-lg font-medium tracking-tight text-ink">{title}</h3>}
      {description && <p className="mt-1 text-sm leading-relaxed text-muted text-pretty">{description}</p>}
      {note && <p className="mt-2 text-xs italic leading-relaxed text-muted/80">{note}</p>}
    </div>
  );
}

function Figure({ image, eager, className }: { image: ResolvedImage; eager?: boolean; className?: string }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-sm">
        <Photo
          src={image.src}
          alt={image.editorialTitle}
          eager={eager}
          sizes="(max-width: 1280px) 100vw, 1024px"
          className="transition-transform duration-700 hover:scale-[1.01]"
        />
      </div>
      <Caption title={image.editorialTitle} description={image.description} note={image.note} />
    </figure>
  );
}

function ChapterBlocks({ chapter, images, chapterIndex }: { chapter: StoryChapter; images: { src?: string }[]; chapterIndex: number }) {
  const blocks = blocksForChapter(chapter, images, chapterIndex);

  return (
    <div className="space-y-14 md:space-y-20">
      {blocks.map((block, i) => {
        if (block.type === "two-up") {
          return (
            <Reveal key={`${chapter.id}-${i}`} delay={i * 0.05}>
              <div className="grid gap-10 sm:grid-cols-2 sm:items-start sm:gap-8">
                <Figure image={block.a} eager={chapterIndex === 0 && i === 0} />
                <Figure image={block.b} className={cn("sm:mt-12")} />
              </div>
            </Reveal>
          );
        }
        if (block.type === "offset") {
          return (
            <Reveal key={`${chapter.id}-${i}`} delay={i * 0.05}>
              <div className="grid gap-10 sm:grid-cols-12 sm:items-start sm:gap-8">
                <Figure image={block.a} eager={chapterIndex === 0 && i === 0} className="sm:col-span-7" />
                <Figure image={block.b} className="mt-0 sm:col-span-5 sm:mt-14" />
              </div>
            </Reveal>
          );
        }
        if (block.type === "detail-pair") {
          return (
            <Reveal key={`${chapter.id}-${i}`} delay={i * 0.05}>
              <div className="mx-auto grid max-w-3xl gap-10 sm:grid-cols-2 sm:items-start sm:gap-8">
                <Figure image={block.a} />
                <Figure image={block.b} className="sm:mt-10" />
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
                : "";
        return (
          <Reveal key={`${chapter.id}-${i}`} delay={i * 0.05} className={width}>
            <Figure image={block.image} eager={chapterIndex === 0 && i === 0} />
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

export default async function ProjectEditorial({ story, images, categoryLabel, category, slug }: ProjectEditorialProps) {
  const heroSrc =
    srcFor(story.coverImage, images) || images.find((img) => img.src)?.src || "";

  const projects = allProjects();
  const currentIndex = projects.findIndex((p) => p.category === category && p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const nextImages = getImagesForProject(nextProject.category, nextProject.slug);
  let nextCoverSrc = nextImages[0]?.src ?? "";
  const nextStory = await getProjectStory(nextProject.category, nextProject.slug);
  if (nextStory?.coverImage) {
    nextCoverSrc = srcFor(nextStory.coverImage, nextImages) || nextCoverSrc;
  }

  const metaLine = [story.time, story.location].filter(Boolean).join(" · ");
  const detailRows: Array<[string, string]> = [];
  if (story.camera) detailRows.push(["camera", story.camera]);
  if (story.lens && story.lens !== "Not specified") detailRows.push(["lens", story.lens]);
  if (story.flash) detailRows.push(["lighting", story.flash]);
  if (story.lightingSetup?.length) detailRows.push(["setup", story.lightingSetup.map((l) => `${l.role} — ${l.detail}`).join(" · ")]);
  if (story.location) detailRows.push(["location", story.location]);
  if (story.time) detailRows.push(["season", story.time]);
  if (story.outfits && Object.keys(story.outfits).length) {
    detailRows.push(["outfits", Object.entries(story.outfits).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" · ")]);
  }

  return (
    <article className="mx-auto w-full max-w-5xl px-6 pb-28 pt-24 md:pb-32 md:pt-32">
      <div className="mb-14 flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-brand"
        >
          <ChevronLeft className="h-4 w-4" /> Projects
        </Link>
        <span className="hidden font-mono text-xs uppercase tracking-widest text-muted/60 sm:block">{categoryLabel}</span>
      </div>

      <header>
        <figure className="mx-auto w-full max-w-[min(56rem,calc(80svh*0.75))]">
          <Photo src={heroSrc} alt={story.projectTitle} eager fit="contain" sizes="(max-width: 1280px) 90vw, 896px" />
        </figure>
        <div className="mx-auto mt-10 max-w-3xl text-center">
          <div className="flex flex-col items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">{categoryLabel}</span>
            <h1 className="font-display text-4xl font-medium tracking-tight text-balance text-ink md:text-6xl">
              {story.projectTitle}
            </h1>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">{metaLine}</p>
            {story.tagline && (
              <p className="mt-2 max-w-xl text-base leading-relaxed text-muted text-pretty">{story.tagline}</p>
            )}
          </div>
        </div>
      </header>

      {story.introduction && (
        <section className="mx-auto mt-20 max-w-2xl md:mt-28">
          <Reveal>
            <p className="font-display text-xl leading-relaxed text-balance text-ink/90 md:text-2xl">{story.introduction}</p>
          </Reveal>
        </section>
      )}

      <section className="mt-20 md:mt-28">
        {story.visualChapters.map((chapter, i) => (
          <div key={chapter.id} className={cn("space-y-14 md:space-y-20", i > 0 && "mt-24 md:mt-32")}>
            <ChapterHeader chapter={chapter} index={i} />
            <ChapterBlocks chapter={chapter} images={images} chapterIndex={i} />
          </div>
        ))}
      </section>

      {story.favoriteImages && story.favoriteImages.length > 0 && (
        <section className="mt-24 md:mt-32">
          <Reveal>
            <div className="mb-10 flex items-center gap-4">
              <span className="h-px w-10 bg-brand/60" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">One I keep coming back to</span>
            </div>
          </Reveal>
          <div className="space-y-14 md:space-y-20">
            {story.favoriteImages.map((fav, i) => (
              <Reveal key={`${fav.file}-${i}`} delay={i * 0.05}>
                <figure className="mx-auto max-w-4xl">
                  <div className="overflow-hidden rounded-sm">
                    <Photo
                      src={srcFor(fav.file, images)}
                      alt={fav.editorialTitle}
                      sizes="(max-width: 1280px) 100vw, 1024px"
                      className="transition-transform duration-700 hover:scale-[1.01]"
                    />
                  </div>
                  <Caption title={fav.editorialTitle} description={fav.description} note={fav.note} />
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {story.closingStory && (
        <section className="mx-auto mt-24 max-w-2xl md:mt-32">
          <Reveal>
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-10 bg-brand/60" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">The Story</span>
            </div>
            <p className="font-display text-xl leading-relaxed text-balance text-ink/90 whitespace-pre-wrap md:text-2xl">
              {story.closingStory}
            </p>
          </Reveal>
        </section>
      )}

      {detailRows.length > 0 && (
        <section className="mx-auto mt-24 max-w-2xl md:mt-32">
          <div className="border-t border-line pt-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">The Details</span>
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

      <Link
        href={`/projects/${nextProject.category}/${nextProject.slug}`}
        className="group mt-24 block md:mt-32"
      >
        <div className="mb-8 border-t border-line pt-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Next Project</span>
        </div>
        <figure className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-sm">
            <Photo
              src={nextCoverSrc}
              alt={nextProject.title}
              sizes="(max-width: 1280px) 100vw, 1024px"
              className="transition-transform duration-700 group-hover:scale-[1.01]"
            />
          </div>
          <figcaption className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted/70">
                {nextProject.categoryLabel}
              </span>
              <span className="mt-1 block font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
                {nextProject.title}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand">
              View project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </figcaption>
        </figure>
      </Link>
    </article>
  );
}