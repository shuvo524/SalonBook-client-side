import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Service images come from the API: Unsplash placeholders in seed data,
  // ImgBB uploads for admin-added services, Google avatars for profiles.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Examiner feedback (Assignment 9, 2026-11-21): auth must use the Client
  // URL, not the server URL. Every /api/* call from the browser goes to
  // this origin and is rewritten to the Express server, so the server URL
  // never appears in the browser during auth. Data calls in lib/api.ts
  // still use NEXT_PUBLIC_API_URL directly (JWT bearer, no cookies).
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return [];
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
