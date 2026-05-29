import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  prefetch: true,
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  site: "https://blog.elcokiin.my",

  vite: {
    // Astro 5 currently uses Vite 6 internally.
    // Tailwind Vite plugin types target Vite 7 and require this cast.
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["gsap", "split-type"],
      exclude: ["astro", "@elcokiin/ui", "@elcokiin/backend"],
    },
  },

  integrations: [react(), sitemap()],
});

