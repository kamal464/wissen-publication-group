import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For EC2 deployment with PM2 - do NOT use standalone mode
  // Standalone mode is for Docker containers (not used on EC2)
  // output: 'standalone', // DISABLED for EC2 deployment
  images: {
    unoptimized: false,
  },
  trailingSlash: true,
  // Fix lockfile warning by explicitly setting the root
  outputFileTracingRoot: require('path').join(__dirname),
  // Note: NEXT_PUBLIC_* variables are automatically available
  // Removed Turbopack from build to ensure env vars are properly replaced
  
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep errors and warnings in production
    } : false,
  },
  // Optimize build performance - tree-shake unused PrimeReact components
  experimental: {
    optimizePackageImports: ['primereact', 'primeicons'],
  },
};

export default nextConfig;
