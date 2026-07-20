import type { NextConfig } from "next";

const imageKitUrlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const imageKitRemotePattern = (() => {
  if (!imageKitUrlEndpoint) {
    return undefined;
  }

  try {
    const url = new URL(imageKitUrlEndpoint);

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      pathname: "/**",
    };
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageKitRemotePattern ? [imageKitRemotePattern] : [],
  },
};

export default nextConfig;
