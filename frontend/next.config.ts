import type { NextConfig } from "next";

// These options exist only to make the self-hosted Docker image work; on
// Vercel they break the build (Vercel manages output + file tracing itself,
// and `output: "standalone"` makes its adapter look for a .next/package.json
// that isn't there). Vercel sets VERCEL=1, so apply them everywhere else.
const dockerOnly: NextConfig = process.env.VERCEL
  ? {}
  : {
      // Self-contained server bundle for the Docker runtime image.
      output: "standalone",
      // A stray package-lock.json above this dir makes Next guess the wrong
      // workspace root and nest the standalone output, breaking Docker COPY
      // paths. Pin the root to this project.
      outputFileTracingRoot: __dirname,
      turbopack: { root: __dirname },
    };

const nextConfig: NextConfig = {
  ...dockerOnly,

  // Proxy API calls to the FastAPI backend so the browser hits a same-origin
  // path. BACKEND_URL is baked at build time (set it per environment).
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:8000";
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
