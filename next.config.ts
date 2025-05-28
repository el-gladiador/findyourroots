import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Note: headers() is not supported in static export mode
  // The headers will need to be configured on the server serving the static files
};

export default nextConfig;
