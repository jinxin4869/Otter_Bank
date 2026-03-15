import type { NextConfig } from "next";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  images: {
    domains: [
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      // 他に必要なドメインがあれば追加
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://back:3000'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig
