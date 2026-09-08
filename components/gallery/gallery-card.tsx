import Link from "next/link";
import Photo from "@/components/shared/photo";
import Reveal from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";
import { presignGet, r2Config, r2KeysFromSource } from "@/lib/r2";
import type { Gallery } from "@/lib/types";
import { cn } from "@/lib/utils";

async function resolveCover(cover: string): Promise<string> {
  if (!cover.startsWith("r2:")) return cover;
  const cfg = r2Config();
  const keys = r2KeysFromSource(cover);
  if (!cfg || !keys) return cover;
  return presignGet(cfg, keys.preview, 900);
}

interface GalleryCardProps {
  gallery: Gallery;
  index: number;
  unlocked?: boolean;
}

export default async function GalleryCard({
  gallery,
  index,
  unlocked = false,
}: GalleryCardProps) {
  const cover = await resolveCover(gallery.cover);

  return (
    <Reveal delay={(index % 3) * 0.08}>
      <Link
        href={`/gallery/${gallery.slug}`}
        className="group block overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <div className="relative overflow-hidden">
          <Photo
            src={cover}
            alt={gallery.title}
            sizes="(max-width: 768px) 100vw, 33vw"
            ratio={3 / 4}
            className={cn(
              "aspect-[3/4] transition-transform duration-700 group-hover:scale-[1.04] transition-opacity duration-300",
              !unlocked && "opacity-50 grayscale"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/85 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />

          {!unlocked && gallery.password && (
            <div className="absolute inset-0 flex items-center justify-center bg-canvas/50 backdrop-blur-sm transition-opacity duration-300">
              <div className="text-center">
                <Lock className="mx-auto mb-2 h-8 w-8 text-cream/80" />
                <span className="font-mono text-xs uppercase tracking-widest text-cream/80">
                  Private
                </span>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 flex items-center gap-2">
            {unlocked ? (
              <Badge variant="solid" className="gap-1.5">
                <Unlock className="h-3 w-3" /> Unlocked
              </Badge>
            ) : gallery.password ? (
              <Badge variant="brand" className="gap-1.5 border-white/20">
                <Lock className="h-3 w-3" /> Private
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow text-brand">{gallery.category}</span>
            {gallery.date && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {gallery.date}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-2xl font-medium">{gallery.title}</h3>
          {gallery.location && (
            <p className="mt-1 font-mono text-xs text-muted">{gallery.location}</p>
          )}
        </div>
      </Link>
    </Reveal>
  );
}