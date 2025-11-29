import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Cloud Run deployment (supports SSR and dynamic routes)
  output: 'standalone', // Creates a standalone server
  images: {
    unoptimized: true, // For better compatibility
  },
  // Enable trailing slash for better routing
  trailingSlash: true,
};

export default nextConfig;
