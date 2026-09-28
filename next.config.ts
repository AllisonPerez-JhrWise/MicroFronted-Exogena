import type { NextConfig } from "next";

// Multi-Zones: esta app se sirve bajo su propio basePath (p. ej. /exogena) y el
// host la integra con un rewrite hacia la URL donde esté desplegada.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  basePath,
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
