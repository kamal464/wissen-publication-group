import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Firebase Hosting - static export
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // Enable trailing slash for better routing
  trailingSlash: true,
  // Disable server-side features for static export
  distDir: 'out',
  // Skip dynamic routes during static export (they'll be handled client-side)
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
