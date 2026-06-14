import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@elcokiin/ui/command";
import { useQuery } from "convex/react";
import { PlusIcon, SearchIcon, UserIcon } from "lucide-react";
import { useState } from "react";

import { CreateAuthorDialog } from "@/components/authors/create-author-dialog";

type AuthorSearchCommandProps = {
  onSelect: (authorName: string, authorId?: Id<"authors">) => void;
};

export function AuthorSearchCommand({ onSelect }: AuthorSearchCommandProps) {
  const [authorSearch, setAuthorSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const reprintedAuthors = useQuery(
    api.authors.queries.listOriginalAuthors,
    { paginationOpts: { numItems: 100, cursor: null } },
  );

  const filteredAuthors = reprintedAuthors?.page.filter((author) =>
    authorSearch
      ? author.name.toLowerCase().includes(authorSearch.toLowerCase())
      : true,
  );

  const displayedAuthors = filteredAuthors?.slice(0, 5);
  const isSearching = authorSearch.trim().length > 0;
  const showEmpty = reprintedAuthors && displayedAuthors && displayedAuthors.length === 0;
  const showList = displayedAuthors && displayedAuthors.length > 0;

  const handleCreateSuccess = (name: string) => {
    setShowCreateDialog(false);
    onSelect(name);
  };

  return (
    <>
      <Command className="border-0 bg-transparent" shouldFilter={false}>
        <CommandInput
          placeholder="Search authors..."
          value={authorSearch}
          onValueChange={setAuthorSearch}
        />
        <CommandList className="max-h-[200px]">
          {showList && (
            <>
              <CommandGroup>
                {displayedAuthors.map((author) => (
                  <CommandItem
                    key={author._id}
                    value={author.name}
                    onSelect={() => {
                      setAuthorSearch(author.name);
                      onSelect(author.name, author._id);
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
            </>
          )}
          {showEmpty && isSearching && (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-4">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No authors found</p>
              </div>
            </CommandEmpty>
          )}
          {!reprintedAuthors && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading authors...
            </div>
          )}
          <CommandGroup>
            <CommandItem onSelect={() => setShowCreateDialog(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              <span>Add new author</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      <CreateAuthorDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
