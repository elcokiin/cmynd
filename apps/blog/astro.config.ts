import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  site: "https://blog.elcokiin.my",

  vite: {
    // Astro 5 currently uses Vite 6 internally.
    // Tailwind Vite plugin types target Vite 7 and require this cast.
    // @ts-expect-error Vite plugin type mismatch
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});

