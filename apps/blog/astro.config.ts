import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  prefetch: true,
  output: "server",
  adapter: cloudflare(),
  site: "https://blog.elcokiin.me",

  redirects: {
    "/posts/[slug]": "/[slug]",
  },

  image: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.elcokiin.me" },
      { protocol: "https", hostname: "cdn-dev.elcokiin.me" },
    ],
  },

  vite: {
    // Astro 5 currently uses Vite 6 internally.
    // Tailwind Vite plugin types target Vite 7 and require this cast.
    plugins: [tailwindcss()],
    resolve: {
      alias: [{
        find: /^src\//,
        replacement: fileURLToPath(new URL("../../packages/ui/src/", import.meta.url)),
      }],
    },
    optimizeDeps: {
      include: ["gsap", "split-type"],
      exclude: ["@elcokiin/backend"],
    },
    ssr: {
      noExternal: ["@elcokiin/ui"],
      target: "webworker",
    },
  },

  integrations: [react({ experimentalDisableStreaming: true }), sitemap()],
});
