import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserIcon, CheckIcon, SearchIcon, PlusIcon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";

import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Badge } from "@elcokiin/ui/badge";
import { Switch } from "@elcokiin/ui/switch";
import { Label } from "@elcokiin/ui/label";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { CreateAuthorDialog } from "@/components/admin/create-author-dialog";

export const Route = createFileRoute("/_auth/admin/authors")({
  component: AdminAuthorsPage,
});

export function AdminAuthorsPage() {
  const { handleError } = useErrorHandler();
  const [search, setSearch] = useState("");
  const [showVerified, setShowVerified] = useState(false);
  const [showUnverified, setShowUnverified] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const authorsQuery = useQuery(api.authors.queries.listForAdmin, {
    paginationOpts: { numItems: 10, cursor: null },
    verified: showVerified || showVerified === undefined ? undefined : showVerified,
    onlyReprinted: showUnverified ? true : undefined,
  });

  const authors = authorsQuery?.page || [];
  const isLoading = authorsQuery === undefined;

  const approveMutation = useMutation(api.authors.mutations.approve);

  const handleApproveAuthor = async (authorId: Id<"authors">) => {
    try {
      await approveMutation({ authorId });
    } catch (error) {
      handleError(error, { context: "AdminAuthorsPage.handleApproveAuthor" });
    }
  };

  const filteredAuthors = authors.filter((author) =>
    search
      ? author.name.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Author Management</h2>
        <p className="text-muted-foreground">
          Manage reprinted authors and verification status
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Authors</CardTitle>
            <div className="flex items-center gap-4">
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                Create Author
              </Button>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search authors..."
                  className="w-[200px] pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="unverified-toggle"
                  checked={showUnverified}
                  onCheckedChange={setShowUnverified}
                />
                <Label htmlFor="unverified-toggle" className="text-sm">
                  Unverified
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="verified-toggle"
                  checked={showVerified}
                  onCheckedChange={setShowVerified}
                />
                <Label htmlFor="verified-toggle" className="text-sm">
                  Verified
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading authors...</p>
            </div>
          ) : !filteredAuthors || filteredAuthors.length === 0 ? (
            <div className="py-10 text-center">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No authors found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAuthors.map((author) => (
                <div
                  key={author._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {author.avatarUrl ? (
                        <img
                          src={author.avatarUrl}
                          alt={author.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{author.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {author.isReprinted && (
                          <Badge variant="secondary" className="text-xs">Reprinted</Badge>
                        )}
                        {author.isVerified ? (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">Unverified</Badge>
                        )}
                        {author.userId && (
                          <Badge variant="outline" className="text-xs">Has Account</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(author.createdAt).toLocaleDateString()}
                    </p>
                    {!author.isVerified && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveAuthor(author._id)}
                        className="mt-2"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAuthorDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
