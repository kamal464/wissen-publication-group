import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Firebase Hosting - static export
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
  distDir: 'out',
  // Skip dynamic routes during static export
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
