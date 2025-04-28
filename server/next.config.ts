import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: true,   // React Strict Mode (helpful during development)
  
  // No special static generation or page directory configurations
  images: {
    domains: []  // Disable any automatic image optimization if not required
  }
};


export default nextConfig;
