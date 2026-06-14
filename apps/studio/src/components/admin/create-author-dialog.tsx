import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";

import { Button } from "@elcokiin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@elcokiin/ui/dialog";
import { Input } from "@elcokiin/ui/input";
import { Textarea } from "@elcokiin/ui/textarea";
import { Label } from "@elcokiin/ui/label";

import { useErrorHandler } from "@/hooks/use-error-handler";

interface CreateAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (name: string) => void;
}

export function CreateAuthorDialog({ open, onOpenChange, onSuccess }: CreateAuthorDialogProps) {
  const { handleError } = useErrorHandler();
  const createAuthor = useMutation(api.authors.mutations.createAuthor);
  const isAdmin = useQuery(api.auth.isCurrentUserAdmin);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const createdName = name.trim();
      await createAuthor({
        name: createdName,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      onOpenChange(false);
      onSuccess?.(createdName);
      setName("");
      setBio("");
      setAvatarUrl("");
    } catch (error) {
      handleError(error, { context: "CreateAuthorDialog.handleSubmit" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Author</DialogTitle>
            <DialogDescription>
              Add a new author to the platform.
              {isAdmin ? (
                <span className="block mt-1 text-green-600 dark:text-green-400">
                  This author will be automatically verified.
                </span>
              ) : (
                <span className="block mt-1 text-yellow-600 dark:text-yellow-400">
                  This author will require verification.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Author name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                type="url"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Author biography"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "Creating..." : "Create Author"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
