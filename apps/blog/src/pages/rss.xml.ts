import rss from "@astrojs/rss";

import { listAllPublishedDocuments } from "../lib/convex";
import { SITE } from "../lib/config";

export async function GET() {
  const posts = await listAllPublishedDocuments();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: SITE.url,
    items: posts.map(post => ({
      title: post.title,
      description: `${post.author.name} · ${post.type}`,
      pubDate: new Date(post.publishedAt),
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>${SITE.locale}</language>`,
    stylesheet: false,
  });
}
