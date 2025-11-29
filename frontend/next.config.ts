import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For SSR deployment (Cloud Run)
  output: 'standalone', // Required for Docker/Cloud Run deployment
  images: {
    unoptimized: false, // Can use optimized images with SSR
  },
  trailingSlash: true,
  // Explicitly expose environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
