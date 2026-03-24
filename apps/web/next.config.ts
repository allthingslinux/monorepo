import { cpus } from "node:os";
import path from "node:path";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

// Validate environment variables at build time
import "./src/env";

// pnpm hoists `next` under monorepo/node_modules/.pnpm/...; symlinks from apps/web/node_modules
// point outside apps/web. Turbopack only resolves inside turbopack.root, so the root must be
// the monorepo directory that contains node_modules/.pnpm (see turbopack root-directory docs).
const monorepoRoot = path.resolve(import.meta.dirname, "..", "..");

const nextConfig: NextConfig = {
  compiler: {
    // Remove console logs for better performance in production
    // removeConsole:
    //   process.env.NODE_ENV === 'production'
    //     ? true
    //     : {
    //         exclude: ['error', 'warn'],
    //       },
    // Keep default (React JSX). `emotion: true` applies Emotion’s JSX runtime to
    // transpiled packages too (e.g. `@atl/ui`) and breaks unless they depend on `@emotion/react`.
    // Remove React properties in production
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },
  // Performance optimizations
  compress: true,
  // Turbopack configuration moved from experimental
  experimental: {
    // Enable build worker threads
    cpus: Math.max(1, Math.floor(cpus().length / 2)),
    // mdxRs: true,
    cssChunking: true,
    // Disable server minification for easier performance profiling
    serverMinification: false,
    // Disable server source maps to prevent esbuild errors in OpenNext/Cloudflare builds
    serverSourceMaps: false,
    // Optimize bundle analysis - disabled to prevent critters issues
    // optimizeCss: true,
    // Use SWC for faster compilation
    swcTraceProfiling: false,
    // Optimize webpack memory usage (reduces max memory, may slightly increase build time)
    webpackMemoryOptimizations: true,
  },
  // Add headers for API endpoints
  headers() {
    return [
      {
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
        source: "/:path*",
      },
      {
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
        source: "/api/:path*",
      },
    ];
  },
  // Image optimizations
  images: {
    contentDispositionType: "attachment" as const,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    dangerouslyAllowSVG: true,
    // Reduced device sizes for faster processing
    deviceSizes: [640, 828, 1200, 1920],
    // Optimized image settings for better performance
    formats: ["image/avif", "image/webp"] as const,
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        hostname: "contrib.rocks",
        protocol: "https" as const,
      },
      {
        hostname: "allthingslinux.org",
        protocol: "https" as const,
      },
      {
        hostname: "dcbadge.limes.pink",
        protocol: "https" as const,
      },
      {
        hostname: "discord.gg",
        protocol: "https" as const,
      },
      {
        hostname: "i.imgur.com",
        protocol: "https" as const,
      },
      {
        hostname: "sprut.ai",
        protocol: "https" as const,
      },
    ],
    // Disable image optimization for Cloudflare Workers deployment
    // Cloudflare Workers don't support Sharp, which is required for Next.js image optimization
    unoptimized: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },

  // Output configuration for better caching
  output: "standalone",
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  poweredByHeader: false,

  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  // Add redirects
  redirects() {
    return [
      {
        destination: "/contribute",
        permanent: true,
        source: "/donate",
      },
      {
        destination: "/apply",
        permanent: true,
        source: "/get-involved",
      },
      {
        destination: "/apply",
        permanent: true,
        source: "/roles",
      },
      {
        destination: "/apply",
        permanent: true,
        source: "/careers",
      },
    ];
  },
  transpilePackages: ["@atl/ui"],

  turbopack: {
    root: monorepoRoot,
  },

  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "production",
  },
};

export default withContentlayer(nextConfig);

initOpenNextCloudflareForDev();