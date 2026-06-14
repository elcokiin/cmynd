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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@elcokiin/ui/dialog";
import { useQuery } from "convex/react";
import { PlusIcon, UserIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { CreateAuthorDialog } from "@/components/admin/create-author-dialog";

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const reprintedAuthors = useQuery(
    api.authors.queries.listUnverifiedReprinted,
    { paginationOpts: { numItems: 100, cursor: null } },
  );

  const handleSelectAuthor = (name: string) => {
    onSelect(name);
    onClose();
  };

  const handleCreateSuccess = (name: string) => {
    setShowCreateDialog(false);
    onSelect(name);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Original Author</DialogTitle>
            <DialogDescription>
              Choose an existing author or add a new one.
            </DialogDescription>
          </DialogHeader>

          <Command className="rounded-lg border">
            <CommandInput
              placeholder="Search authors..."
              value={authorSearch}
              onValueChange={setAuthorSearch}
            />
            <CommandList>
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 py-4">
                  <SearchIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No authors found</p>
                </div>
              </CommandEmpty>
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
                      onSelect={() => handleSelectAuthor(author.name)}
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
                <CommandItem onSelect={() => setShowCreateDialog(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  <span>Add new author</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateAuthorDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
