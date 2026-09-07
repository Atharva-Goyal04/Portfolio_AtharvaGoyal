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
      // Portfolio photos are hosted on Vercel Blob.
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;