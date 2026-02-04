import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['typeorm', 'pg'],
};

export default nextConfig;
