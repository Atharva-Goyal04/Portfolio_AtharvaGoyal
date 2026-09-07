import Image from "next/image";
import { imageInfo } from "@/lib/images";
import { cn } from "@/lib/utils";

export interface PhotoProps {
  src: string;
  alt?: string;
  sizes?: string;
  eager?: boolean;
  priority?: boolean;
  fit?: "cover" | "contain";
  ratio?: number;
  quality?: number;
  className?: string;
  imgClassName?: string;
}

export default function Photo({
  src,
  alt = "",
  sizes = "100vw",
  eager = false,
  priority = false,
  fit = "cover",
  ratio,
  quality,
  className,
  imgClassName,
}: PhotoProps) {
  const info = imageInfo(src);
  const aspect = ratio ?? (info ? info.width / info.height : 1.5);
  const blur = info?.blur;
  // Originals live on Vercel Blob now; fall back to the local path in dev if unindexed.
  const source = info?.url ?? src;

  const commonImg = {
    src: source,
    alt,
    sizes,
    priority: eager || priority,
    placeholder: blur ? ("blur" as const) : undefined,
    blurDataURL: blur,
  };

  if (!info) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={source}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={cn("h-auto w-full", className)}
      />
    );
  }

  if (fit === "contain") {
    return (
      <Image
        {...commonImg}
        alt={alt}
        width={info.width}
        height={info.height}
        quality={quality}
        className={cn("h-auto w-auto max-w-full", className, imgClassName)}
      />
    );
  }

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: aspect }}
    >
      <Image {...commonImg} alt={alt} fill quality={quality} className={cn("object-cover", imgClassName)} />
    </div>
  );
}