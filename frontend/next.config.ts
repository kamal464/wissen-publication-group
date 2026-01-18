import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For EC2 deployment with PM2 - do NOT use standalone mode
  // Standalone mode is only for Docker/Cloud Run
  // output: 'standalone', // DISABLED for EC2 deployment
  images: {
    unoptimized: false,
  },
  trailingSlash: true,
  // Note: NEXT_PUBLIC_* variables are automatically available
  // Removed Turbopack from build to ensure env vars are properly replaced
};

export default nextConfig;
