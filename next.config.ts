import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    domains: ['images.credly.com', 'www.svgrepo.com', 'www.freecodecamp.org', 'qodjeibshsyaaadbptbu.supabase.co'],
  },
};

export default nextConfig;
