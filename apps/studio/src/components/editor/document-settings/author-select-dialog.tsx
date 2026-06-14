import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@elcokiin/ui/command";
import { Label } from "@elcokiin/ui/label";
import { useQuery } from "convex/react";
import { PlusIcon, UserIcon } from "lucide-react";
import { useState } from "react";

type AuthorSelectDialogProps = {
  open: boolean;
  onSelect: (authorName: string) => void;
  onClose: () => void;
};

export function AuthorSelectDialog({
  open,
  onSelect,
  onClose,
}: AuthorSelectDialogProps) {
  const [authorSearch, setAuthorSearch] = useState("");

  const reprintedAuthors = useQuery(
    api.authors.queries.listUnverifiedReprinted,
    { paginationOpts: { numItems: 100, cursor: null } },
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="bg-background rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium mb-4">
            Select Original Author
          </h3>
          <div className="space-y-4">
            <Label>Search Existing Reprinted Authors</Label>
            <Command className="rounded-lg border">
              <CommandInput
                placeholder="Search authors..."
                value={authorSearch}
                onValueChange={setAuthorSearch}
              />
              <CommandList>
                <CommandEmpty>No authors found.</CommandEmpty>
                <CommandGroup>
                  {reprintedAuthors?.page
                    .filter((author) =>
                      authorSearch
                        ? author.name
                            .toLowerCase()
                            .includes(authorSearch.toLowerCase())
                        : true,
                    )
                    .map((author) => (
                      <CommandItem
                        key={author._id}
                        value={author.name}
                        onSelect={() => {
                          onSelect(author.name);
                          onClose();
                        }}
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{author.name}</span>
                        {!author.isVerified && (
                          <span className="ml-auto text-xs text-yellow-600">
                            (unverified)
                          </span>
                        )}
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={onClose}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    <span>Add new author</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
