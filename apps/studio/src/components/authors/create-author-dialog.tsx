import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Badge } from "@elcokiin/ui/badge";
import { Button } from "@elcokiin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@elcokiin/ui/dialog";
import { Label } from "@elcokiin/ui/label";
import { UserIcon, ImageIcon, FileTextIcon, CheckIcon, ClockIcon } from "lucide-react";

import { InputWithIcon, TextareaWithIcon } from "@/components/ui/input-with-icon";
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Author</DialogTitle>
            <DialogDescription>
              Add a new author to the platform.
            </DialogDescription>
            <div className="mt-2">
              {isAdmin ? (
                <Badge variant="default" className="gap-1.5 bg-success/15 text-success hover:bg-success/20">
                  <CheckIcon className="h-3 w-3" />
                  Auto-verified
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1.5 border-warning/30 text-warning">
                  <ClockIcon className="h-3 w-3" />
                  Requires verification
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <InputWithIcon
                icon={<UserIcon />}
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gabriel García Márquez"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatarUrl" className="text-sm font-medium">Avatar</Label>
              <div className="flex items-center gap-3">
                {avatarUrl.trim() && (
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full border bg-muted">
                    <img
                      src={avatarUrl.trim()}
                      alt="Preview"
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <InputWithIcon
                  icon={<ImageIcon />}
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
              <TextareaWithIcon
                icon={<FileTextIcon />}
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
