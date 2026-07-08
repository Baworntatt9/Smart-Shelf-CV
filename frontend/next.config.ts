import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API calls to the FastAPI backend during development so the browser
  // hits a same-origin path and we avoid CORS in dev.
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:8000";
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
