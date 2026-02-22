import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@elcokiin/ui", "@elcokiin/env", "@elcokiin/errors"],
};

export default nextConfig;
