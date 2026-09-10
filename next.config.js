/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This site never uses next/image (all photos are plain <img> with
  // owner-supplied URLs), so the built-in image optimization route serves
  // no purpose here — disabling it closes that route's attack surface
  // entirely (see GHSA-2xp9-vwfh-vxw4, a critical AVIF-processing RCE)
  // without requiring a major-version Next.js upgrade.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
