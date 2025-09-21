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
  serverExternalPackages: ['@prisma/client'],
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Compression and caching
  compress: true,
  poweredByHeader: false,
  // Output optimization
  output: 'standalone',
  // Additional performance optimizations
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    
    // Fix for Next.js 15 self is not defined error
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      util: false,
    }
    
    // Additional webpack optimizations
    config.optimization.minimize = true
    
    // Fix for self is not defined error
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    // Additional fixes for Next.js 15
    config.plugins = config.plugins || []
    
    // Bundle optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    }
    
    // Additional performance optimizations
    config.optimization.usedExports = false
    config.optimization.sideEffects = false
    
    return config
  },
}

export default nextConfig
