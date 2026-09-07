"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>{children}</ThemeProvider>
    </MotionConfig>
  );
}