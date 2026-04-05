import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.credly.com' },
      { protocol: 'https', hostname: 'www.svgrepo.com' },
      { protocol: 'https', hostname: 'www.freecodecamp.org' },
      { protocol: 'https', hostname: 'qodjeibshsyaaadbptbu.supabase.co' },
    ],
  },
};

export default nextConfig;
