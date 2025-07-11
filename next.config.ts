import withSerwist from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sua configuração existente do Next.js
  images: {
    domains: ["storage.googleapis.com"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
    serverActions: {
      // CORREÇÃO: Usamos o valor em bytes em vez da string "5mb"
      bodySizeLimit: 5242880, 
    },
  },
};

// Envolve sua configuração do Next.js com a do Serwist
export default withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);