/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@prisma/client", "jspdf", "html2canvas"],
  // Performance optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  // Compression and caching
  compress: true,
  poweredByHeader: false,
  // Output optimization
  output: "standalone",
  // Additional performance optimizations
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Only add externals for server-side builds
    if (isServer) {
      config.externals.push("@prisma/client");
    }

    // Basic fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      util: false,
      path: false,
      os: false,
      buffer: false,
      process: false,
    };

    return config;
  },
};

export default nextConfig;
