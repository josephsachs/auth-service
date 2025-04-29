/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Try disabling strict mode
  output: "standalone",

  // Disable image optimization
  images: {
    unoptimized: true,
  },

  // Skip validation checks
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Simplify build output
  swcMinify: false,

  // Disable many optimizations to simplify the build
  experimental: {
    optimizeCss: false,
    optimizeServerReact: false,
    disableOptimizedLoading: true,
  },
};

module.exports = nextConfig;
