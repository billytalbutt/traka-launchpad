import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "launchpad.traka.test",
    "launchpad.traka.test:3000",
    "https://launchpad.traka.test",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "hoirqrkdgbmvpwutwuwj.supabase.co",
      },
    ],
  },
};

export default nextConfig;
