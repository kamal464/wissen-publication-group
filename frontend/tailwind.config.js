/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind v4 + Next 15: PostCSS plugin handles scanning, but keeping content for safety.
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  // Keep config minimal to avoid plugin/version conflicts.
};