import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For SSR deployment (Cloud Run)
  output: 'standalone', // Required for Docker/Cloud Run deployment
  images: {
    unoptimized: false, // Can use optimized images with SSR
  },
  trailingSlash: true,
  // Note: NEXT_PUBLIC_* variables are automatically available
  // No need to explicitly declare them in env
};

export default nextConfig;
