import { createFileRoute } from "@tanstack/react-router";

import { PublishedDocumentList } from "@/components/admin/published-document-list";

type PublishedSearch = {
  page?: number;
  search?: string;
};

export const Route = createFileRoute("/_auth/admin/published")({
  component: AdminPublishedPage,
  validateSearch: (search: Record<string, unknown>): PublishedSearch => {
    return {
      page: Number(search.page) || 1,
      search: (search.search as string) || "",
    };
  },
});

export function AdminPublishedPage() {
  const { page: urlPage = 1, search = "" } = Route.useSearch();

  return (
    <div className="flex h-full flex-col">
      <div className="container mx-auto space-y-6 p-6">
        <div>
          <h2 className="mb-2 text-3xl font-bold">Published Documents</h2>
          <p className="text-muted-foreground">
            Manage which published documents are visible to the public.
          </p>
        </div>

        <PublishedDocumentList urlPage={urlPage} search={search} />
      </div>
    </div>
  );
}
