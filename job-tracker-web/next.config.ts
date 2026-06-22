import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this app so Turbopack doesn't walk up and
    // pick the stray root-level package-lock.json as the inferred root.
    root: __dirname,
  },
};

export default nextConfig;
