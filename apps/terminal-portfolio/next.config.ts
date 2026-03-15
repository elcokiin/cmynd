import type { NextConfig } from "next";

const EMBED_ROUTE = "/embed/terminal";

function getAllowedEmbedOrigins(rawOrigins: string | undefined): string[] {
  if (!rawOrigins) return [];

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .flatMap((origin) => {
      try {
        const url = new URL(origin);
        const isHttp = url.protocol === "http:" || url.protocol === "https:";
        const hasExtraParts = Boolean(url.pathname !== "/" || url.search || url.hash);

        if (!isHttp || hasExtraParts) {
          return [];
        }

        return [url.origin];
      } catch {
        return [];
      }
    });
}

const allowedEmbedOrigins = getAllowedEmbedOrigins(process.env.EMBED_ALLOWED_ORIGINS);
const frameAncestors = ["'self'", ...allowedEmbedOrigins].join(" ");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@elcokiin/ui", "@elcokiin/env", "@elcokiin/errors"],
  async headers() {
    return [
      {
        source: EMBED_ROUTE,
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
