import { ConvexHttpClient } from "convex/browser";
import { api } from "@elcokiin/backend/convex/_generated/api";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type {
  PublishedDocument,
  PublishedDocumentListItem,
} from "@elcokiin/backend/lib/types/documents";

type PaginationResult<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
};

function getConvexUrl(): string {
  const fromImportMeta = import.meta.env.CONVEX_URL;
  const fromProcess = process.env.CONVEX_URL;
  const convexUrl = fromImportMeta ?? fromProcess;

  if (!convexUrl) {
    throw new Error("CONVEX_URL is not set");
  }

  return convexUrl;
}

function getClient(): ConvexHttpClient {
  return new ConvexHttpClient(getConvexUrl());
}

export async function listAllPublishedDocuments(
  pageSize = 40,
  maxPages = 25,
): Promise<PublishedDocumentListItem[]> {
  const client = getClient();
  const items: PublishedDocumentListItem[] = [];

  let cursor: string | null = null;
  let pageCount = 0;

  while (pageCount < maxPages) {
    const result = (await client.query(api.documents.queries.listPublished, {
      paginationOpts: {
        numItems: pageSize,
        cursor,
      },
    })) as PaginationResult<PublishedDocumentListItem>;

    items.push(...result.page);
    pageCount += 1;

    if (result.isDone) {
      break;
    }

    cursor = result.continueCursor;
  }

  return items;
}

export async function getPublishedDocumentBySlug(
  slug: string,
): Promise<PublishedDocument | null> {
  const client = getClient();
  return await client.query(api.documents.queries.getPublishedBySlug, { slug });
}

export async function getPublicStorageUrl(
  storageId: Id<"_storage">,
): Promise<string | null> {
  const client = getClient();
  return await client.query(api.storage.getPublicUrl, { storageId });
}
