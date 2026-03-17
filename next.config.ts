import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;