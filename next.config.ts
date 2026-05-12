import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "images.cryptocompare.com" },
      { protocol: "https", hostname: "resources.cryptocompare.com" },
      { protocol: "https", hostname: "www.cryptocompare.com" },
    ],
  },
};

export default nextConfig;
