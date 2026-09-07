import { cn } from "@/lib/utils";
import Reveal from "@/components/shared/reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
        <span className="glow-line w-10" />
        <span className="eyebrow text-brand">{eyebrow}</span>
        <span className="glow-line w-10" />
      </div>
      <h2 className="font-display text-4xl font-medium tracking-tight text-balance md:text-6xl">
        {title} {highlight && <em className="text-gradient not-italic">{highlight}</em>}
      </h2>
      {description && (
        <p className={cn("max-w-2xl text-lg leading-relaxed text-muted")}>
          {description}
        </p>
      )}
    </Reveal>
  );
}