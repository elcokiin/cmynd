import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
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
  },

  integrations: [react()],
});

