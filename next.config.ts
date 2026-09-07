import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep these data dirs available to serverless functions at runtime
  // (zip downloads read from public/, gallery loader reads content/).
  outputFileTracingIncludes: {
    "/api/gallery/*": ["./public/images/**/*", "./content/galleries/**/*"],
    "/gallery/*": ["./content/galleries/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;