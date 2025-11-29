import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Cloud Run deployment (supports SSR and dynamic routes)
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
