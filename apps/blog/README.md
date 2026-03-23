# cmynd-astro

Astro SSR blog that consumes published documents from Convex backend.

## Features

- Astro SSR rendering for SEO-friendly HTML with fresh content
- Live data from `api.documents.queries.listPublished` and `getPublishedBySlug`
- TipTap/Novel JSON content rendered to sanitized HTML
- Visual style inspired by `elcokiinBlog` tokens
- Sitemap-ready and RSS-ready Astro setup

## Environment

Create `.env` in this app or export env variable:

```bash
CONVEX_URL=https://<your-convex-deployment>.convex.cloud
```

## Commands

```bash
bun run dev
bun run build
bun run preview
```
