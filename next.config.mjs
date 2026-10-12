/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@tanstack/react-query", "zustand", "lucide-react"],
  },
};

export default nextConfig;
