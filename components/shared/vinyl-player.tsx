"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const TRACKS = ["/audio/audio_01.mp3", "/audio/audio_02.mp3", "/audio/audio_3.mp3", "/audio/audio_4.mp3", "/audio/audio_5.mp3", "/audio/audio_6.mp3", "/audio/audio_7.mp3", "/audio/audio_8.mp3"];

const PALETTE = ["#8a3b34", "#67b6bd", "#534b27", "#bfce72", "#1b1b1b", "#7a5c3d", "#4a6fa5", "#9c4f6d"];

const darken = (hex: string, factor = 0.6) => {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  const r = Math.round(((num >> 16) & 255) * factor);
  const g = Math.round(((num >> 8) & 255) * factor);
  const b = Math.round((num & 255) * factor);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const labelColors = TRACKS.map((_, i) => darken(PALETTE[i % PALETTE.length]));

interface VinylPlayerProps {
  size?: "md" | "lg";
  variant?: "floating" | "inline";
  label?: string;
}

export default function VinylPlayer({ size = "md", variant = "floating", label }: VinylPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lg = size === "lg";
  const wrapperClass = variant === "floating" ? "absolute bottom-5 right-5" : "";
  const buttonClass = lg ? "h-20 w-20" : "h-14 w-14";
  const discClass = lg ? "h-16 w-16" : "h-11 w-11";
  const labelClass = lg ? "h-7 w-7" : "h-5 w-5";
  const armClass = lg ? "h-0.5 w-9" : "h-0.5 w-6";

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isPlaying, currentTrack]);

  const pickNext = () => {
    if (TRACKS.length <= 1) return 0;
    let n;
    do {
      n = Math.floor(Math.random() * TRACKS.length);
    } while (n === currentTrack);
    return n;
  };

  const togglePlay = () => {
    if (TRACKS.length === 0) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(pickNext());
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    if (TRACKS.length === 0) return;
    setCurrentTrack(pickNext());
  };

  return (
    <div className={wrapperClass}>
      <audio
        ref={audioRef}
        src={TRACKS[currentTrack]}
        onEnded={handleEnded}
        className="hidden"
      />
      <div className="flex flex-row-reverse items-center gap-3">
        <motion.button
          onClick={togglePlay}
          aria-label={isPlaying ? "Stop music" : "Play music"}
          className="group relative block cursor-pointer rounded-full bg-surface/80 p-2 shadow-xl backdrop-blur-sm"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
        >
          <div className={`relative flex ${buttonClass} items-center justify-center`}>
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className={`${discClass} rounded-full border border-line`}
              style={{
                background:
                  "conic-gradient(from 0deg, #395144 0deg, #2d4033 30deg, #395144 60deg, #2d4033 90deg, #395144 120deg, #2d4033 150deg, #395144 180deg, #2d4033 210deg, #395144 240deg, #2d4033 270deg, #395144 300deg, #2d4033 330deg, #395144 360deg)",
              }}
            >
              <div
                className={`absolute left-1/2 top-1/2 ${labelClass} -translate-x-1/2 -translate-y-1/2 rounded-full border`}
                style={{
                  backgroundColor: labelColors[currentTrack % labelColors.length],
                  backgroundImage:
                    "repeating-radial-gradient(circle at center, transparent 0px, transparent 1px, rgba(0,0,0,0.22) 1px, rgba(0,0,0,0.22) 2px)",
                }}
              />
            </motion.div>
            <div
              className={`absolute right-[10%] top-1/2 ${armClass} origin-right rounded-full bg-brand transition-transform duration-300 ${
                isPlaying ? "-rotate-[24deg]" : "-rotate-[8deg]"
              }`}
            />
          </div>
        </motion.button>
        {label && (
          <p
            className={`translate-y-1 flex-1 text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.3em] text-brand/50 transition-opacity duration-300 ${
              scrolled ? "opacity-0" : "opacity-100"
            }`}
          >
            {label}
          </p>
        )}
      </div>
    </div>
  );
}