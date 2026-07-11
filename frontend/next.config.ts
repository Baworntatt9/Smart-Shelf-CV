import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle so the Docker runtime image only
  // needs the .next/standalone output plus static assets — no node_modules.
  output: "standalone",

  // A stray package-lock.json above this dir makes Next guess the wrong
  // workspace root and nest the standalone output under sub-dirs, breaking
  // the Docker COPY paths. Pin the root to this project.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },

  // Proxy API calls to the FastAPI backend during development so the browser
  // hits a same-origin path and we avoid CORS in dev.
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:8000";
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
