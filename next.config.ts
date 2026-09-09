import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/photography",
        destination: "/journal",
        permanent: true,
      },
    ];
  },
  // Keep content/ available to serverless functions at runtime (gallery loader).
  // Local photos live in Vercel Blob now, so public/images is not traced.
  outputFileTracingIncludes: {
    "/api/gallery/*": ["./content/galleries/**/*"],
    "/gallery/*": ["./content/galleries/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Portfolio photos are hosted on R2 and served via the lumen-cdn worker.
      { protocol: "https", hostname: "lumen-cdn.lumen-cdn.workers.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;