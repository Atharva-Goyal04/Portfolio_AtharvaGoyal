"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Maximize, Minimize, X } from "lucide-react";
import Photo from "@/components/shared/photo";

export interface LightboxItem {
  id: string;
  src: string;
  title: string;
  subtitle?: string;
  meta?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const open = index >= 0 && index < items.length;
  const current = items[index];

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);

  const resetTransform = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    resetTransform();
  }, [current?.id]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, index, items.length, onClose, onNavigate]);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  if (!open) return null;

  const goTo = (dir: number) => onNavigate((index + dir + items.length) % items.length);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen();
    } catch {
      // fullscreen API unavailable
    }
  };

  const toggleZoom = () => {
    setScale((s) => {
      if (s > 1) setPan({ x: 0, y: 0 });
      return s > 1 ? 1 : 2;
    });
  };

  const onTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      toggleZoom();
    } else {
      lastTapRef.current = now;
    }
  };

  const clampPan = (x: number, y: number) => {
    const el = stageRef.current;
    if (!el) return { x, y };
    const rect = el.getBoundingClientRect();
    const s = scale;
    const maxX = Math.max(0, (rect.width * s - rect.width) / 2);
    const maxY = Math.max(0, (rect.height * s - rect.height) / 2);
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  };

  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touches = e.touches;
    if (touches.length === 2) {
      pinchRef.current = {
        startDist: Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY),
        startScale: scale,
      };
      dragRef.current = null;
    } else if (touches.length === 1) {
      dragRef.current = { x: touches[0].clientX, y: touches[0].clientY, px: pan.x, py: pan.y };
      pinchRef.current = null;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touches = e.touches;
    if (pinchRef.current && touches.length === 2) {
      const dist = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
      setScale(clamp(pinchRef.current.startScale * (dist / pinchRef.current.startDist), 1, 3));
    } else if (dragRef.current && touches.length === 1 && scale > 1) {
      const dx = touches[0].clientX - dragRef.current.x;
      const dy = touches[0].clientY - dragRef.current.y;
      setPan(clampPan(dragRef.current.px + dx, dragRef.current.py + dy));
    }
  };

  const onTouchEnd = () => {
    pinchRef.current = null;
    dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    setScale((s) => clamp(s - e.deltaY * 0.002, 1, 3));
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={rootRef}
        key={`lightbox-${items[index]?.id ?? index}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex flex-col bg-canvas/95 backdrop-blur-md"
        style={{ touchAction: "none" }}
        role="dialog"
        aria-modal="true"
        aria-label={current?.title}
      >
        <div className="flex items-center justify-between p-5 md:p-6">
          <span className="font-mono text-xs tracking-widest text-cream/60">
            {index + 1} / {items.length}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={current?.src}
              download
              onClick={(e) => e.stopPropagation()}
              aria-label="Download image"
              className="rounded-full p-3 text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <Download className="h-5 w-5" />
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="rounded-full p-3 text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
            >
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-3 text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goTo(-1);
          }}
          aria-label="Previous"
          className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-3 text-cream/60 transition-colors hover:bg-white/10 hover:text-cream md:block"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden px-4 md:px-24"
          style={{ touchAction: "none" }}
          onClick={onClose}
        >
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            drag={scale <= 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (scale > 1) return;
              if (Math.abs(info.offset.x) > 80) goTo(info.offset.x < 0 ? 1 : -1);
            }}
            onClick={onTap}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onWheel={onWheel}
            className="flex items-center justify-center"
          >
            <div
              ref={stageRef}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transition: "transform 0.15s ease-out",
                willChange: "transform",
              }}
            >
              <Photo
                src={current.src}
                alt={current.title}
                eager
                fit="contain"
                quality={85}
                sizes="100vw"
                className="max-h-[84vh] w-auto"
                imgClassName="rounded-lg shadow-2xl"
              />
            </div>
          </motion.div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goTo(1);
          }}
          aria-label="Next"
          className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-3 text-cream/60 transition-colors hover:bg-white/10 hover:text-cream md:block"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="flex items-end justify-between gap-6 bg-gradient-to-t from-canvas/90 to-transparent p-6 md:px-10 md:pb-8">
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand">
              {current.subtitle}
            </span>
            <p className="mt-1 truncate font-display text-lg text-cream">{current.title}</p>
            {current.meta && (
              <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-cream/50">
                {current.meta}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}