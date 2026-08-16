import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip responses in production when not handled by the host
  compress: true,

  // Smaller client bundles for icon/motion libraries
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Optimized images (AVIF/WebP) + allowed remote hosts
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "summerofcode.withgoogle.com" },
    ],
  },

  // Long-lived caching for hashed static assets
  async headers() {
    return [
      {
        source: "/:path*\\.(svg|jpg|jpeg|png|webp|avif|ico|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
