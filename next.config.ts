import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Server-side image optimization via the built-in Next pipeline. Our own sharp
  // pipeline pre-generates AVIF/WebP + placeholders on upload (src/lib/images).
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Firebase Storage (production)
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      // Storage emulator (local dev)
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  // sharp is a server-only native dep; keep it external to the server bundle.
  serverExternalPackages: ["firebase-admin", "sharp"],
  eslint: {
    // Lint is run explicitly in CI / `npm run lint`; don't fail production builds on it.
    ignoreDuringBuilds: false,
  },
};

export default withNextIntl(nextConfig);
