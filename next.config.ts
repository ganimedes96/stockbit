import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["storage.googleapis.com"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
