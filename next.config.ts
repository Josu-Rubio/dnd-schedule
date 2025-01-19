import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    domains: ['cdn.discordapp.com'], // Add Discord CDN domain here
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Ensure 'discord.js' is not included in the client-side bundle
      config.externals = config.externals || {};
      config.externals['discord.js'] = 'commonjs discord.js';
    }
    return config;
  },
};

export default nextConfig;