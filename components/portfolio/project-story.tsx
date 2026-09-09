"use client";

import { useState } from "react";
import { ChevronDown, Instagram, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { ProjectStory } from "@/lib/projects";

interface ProjectStoryProps {
  story: ProjectStory;
  images: { src: string; [key: string]: unknown }[];
}

function findImageSrc(storyImages: { file: string }[], file: string, images: { src: string }[]): string {
  const match = storyImages.find((si) => si.file === file);
  if (match) {
    const found = images.find((img) => img.src?.includes(file));
    if (found) return found.src;
  }
  const found = images.find((img) => img.src?.includes(file));
  return found?.src ?? "";
}

export default function ProjectStory({ story, images }: ProjectStoryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-10 border border-line rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-canvas/50 hover:bg-canvas/70 transition-colors text-left"
      >
        <span className="font-display text-lg font-medium">
          {expanded ? "Hide" : "Read"} the Story
        </span>
        <ChevronDown className={cn("h-5 w-5 text-brand transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="p-6 space-y-12">
          {/* Intro */}
          <div className="prose prose-invert max-w-none">
            <p className="text-cream/80 leading-relaxed mb-6">
              {story.projectTitle} &mdash; {story.projectType}
              {story.location ? ` in ${story.location}` : ""}
              {story.time ? `, ${story.time}` : ""}.
              {story.camera && ` Captured on ${story.camera}.`}
              {story.cameraNote && ` ${story.cameraNote}`}
              {story.lens && ` Lens: ${story.lens}.`}
            </p>

            {story.outfits && Object.keys(story.outfits).length > 0 && (
              <div className="mb-6">
                <h4 className="font-display text-sm font-medium text-brand mb-3">Outfits</h4>
                <ul className="space-y-2 text-sm text-cream/80">
                  {Object.entries(story.outfits).map(([key, items]) => (
                    <li key={key} className="flex items-center gap-2">
                      <span className="font-medium text-brand capitalize">{key}:</span>
                      <span>{items.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {story.flash && (
              <p className="mb-6 text-cream/80"><strong>Lighting:</strong> {story.flash}</p>
            )}

            {story.lightingSetup && story.lightingSetup.length > 0 && (
              <div className="mb-6">
                <h4 className="font-display text-sm font-medium text-brand mb-3">Lighting Setup</h4>
                <ul className="space-y-2 text-sm text-cream/80">
                  {story.lightingSetup.map((light, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="font-medium text-brand">{light.role}:</span>
                      <span>{light.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Visual Chapters */}
          <div className="space-y-12 border-t border-line pt-8">
            <h3 className="font-display text-xl font-medium text-brand">Visual Chapters</h3>
            <div className="space-y-10">
              {story.visualChapters.map((chapter) => (
                <div key={chapter.id} className="space-y-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs uppercase tracking-widest text-brand">
                      {chapter.label}
                    </span>
                    {chapter.subtitle && (
                      <span className="font-display text-lg font-medium text-cream">
                        {chapter.subtitle}
                      </span>
                    )}
                  </div>
                  <p className="text-cream/80 leading-relaxed">{chapter.description}</p>
                  
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {chapter.images.map((img, imgIdx) => (
                      <div key={`${chapter.id}-${imgIdx}`} className="group">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface">
                          <Image
                            src={findImageSrc(chapter.images, img.file, images)}
                            alt={img.editorialTitle}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <div className="mt-3 space-y-1">
                          <h4 className="font-display text-base font-medium text-cream">
                            {img.editorialTitle}
                          </h4>
                          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                            {img.role}
                            {img.featured && " &middot; Featured"}
                            {img.favorite && " &middot; Favorite"}
                            {img.alsoInWallpapers && " &middot; Also in Wallpapers"}
                          </p>
                          <p className="text-sm text-cream/70 leading-relaxed">{img.description}</p>
                          {img.note && (
                            <p className="text-xs text-muted/80 italic mt-1">{img.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Images */}
          {story.favoriteImages && story.favoriteImages.length > 0 && (
            <div className="border-t border-line pt-8 space-y-6">
              <h3 className="font-display text-xl font-medium text-brand">Photographer&apos;s Favorites</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {story.favoriteImages.map((fav, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface">
                      <Image
                        src={findImageSrc(story.favoriteImages || [], fav.file, images)}
                        alt={fav.editorialTitle}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-medium text-cream">
                        {fav.editorialTitle}
                      </h4>
                      <p className="text-sm text-cream/70 leading-relaxed">{fav.description}</p>
                      {fav.note && (
                        <p className="text-xs text-muted/80 italic mt-1 border-t border-line pt-2">{fav.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closing Story */}
          {story.closingStory && (
            <div className="border-t border-line pt-8">
              <h3 className="font-display text-xl font-medium text-brand mb-4">Closing Thoughts</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-cream/80 leading-relaxed whitespace-pre-wrap">{story.closingStory}</p>
              </div>
            </div>
          )}

          {/* Instagram References */}
          {story.instagramRefs && story.instagramRefs.length > 0 && (
            <div className="border-t border-line pt-8">
              <h3 className="font-display text-xl font-medium text-brand mb-4">On Instagram</h3>
              <div className="space-y-3">
                {story.instagramRefs.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted hover:text-brand transition-colors"
                  >
                    <Instagram className="h-4 w-4 text-brand" />
                    <span>{ref.title}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}