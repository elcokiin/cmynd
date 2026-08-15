import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { useEffect, useState, useMemo, useRef } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
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
import { ImageDropzone } from "@elcokiin/ui/image-dropzone";
import { Label } from "@elcokiin/ui/label";
import { UserIcon, ImageIcon, FileTextIcon, CheckIcon, ClockIcon, LoaderIcon, Link2Icon, XIcon } from "lucide-react";

import { InputWithIcon, TextareaWithIcon } from "@/components/ui/input-with-icon";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { normalizeOptionalText } from "@/lib/text";

const createAuthorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().max(500, "Bio must be under 500 characters"),
});

type CreateAuthorFormValues = z.infer<typeof createAuthorSchema>;

function AvatarPreview({ url }: { url: string }) {
  const debouncedUrl = useDebouncedValue(url.trim(), 400);
  const [error, setError] = useState(false);

  const validUrl = useMemo(() => {
    if (!debouncedUrl) return "";
    try {
      const parsed = new URL(debouncedUrl);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? debouncedUrl : "";
    } catch {
      return "";
    }
  }, [debouncedUrl]);

  useEffect(() => { setError(false); }, [debouncedUrl]);

  if (!validUrl || error) return null;
  return (
    <div className="relative size-10 shrink-0 overflow-hidden rounded-full border bg-muted">
      <img
        src={validUrl}
        alt="Preview"
        className="size-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

interface CreateAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (name: string, authorId: Id<"authors">) => void;
}

export function CreateAuthorDialog({ open, onOpenChange, onSuccess }: CreateAuthorDialogProps) {
  const { handleError } = useErrorHandler();
  const createAuthor = useMutation(api.authors.mutations.createAuthor);
  const isAdmin = useQuery(api.auth.isCurrentUserAdmin);
  const uploadAvatar = useConvexImageUpload();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    if (open) {
      setAvatarUrl("");
      setPendingFile(null);
      setPreviewUrl("");
      form.reset();
    }
    return () => {
      revokeObjectUrl();
      objectUrlRef.current = null;
    };
  }, [open]);

  const form = useForm({
    defaultValues: {
      name: "",
      bio: "",
    } as CreateAuthorFormValues,
    validators: {
      onSubmit: createAuthorSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const name = value.name.trim();

        let url = avatarUrl.trim();
        let storageId: string | undefined;
        if (pendingFile) {
          setIsUploading(true);
          const result = await uploadAvatar(pendingFile);
          url = result.url;
          storageId = result.storageId;
        }

        const authorId = await createAuthor({
          name,
          bio: normalizeOptionalText(value.bio ?? ""),
          avatarUrl: url ? url : undefined,
          avatarStorageId: url ? storageId : undefined,
        });

        revokeObjectUrl();
        setPendingFile(null);
        setPreviewUrl("");
        onOpenChange(false);
        onSuccess?.(name, authorId);
        form.reset();
      } catch (error) {
        handleError(error, { context: "CreateAuthorDialog.handleSubmit" });
      } finally {
        setIsUploading(false);
      }
    },
  });

  const handleDrop = (file: File) => {
    revokeObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPendingFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearAvatar = () => {
    revokeObjectUrl();
    setAvatarUrl("");
    setPendingFile(null);
    setPreviewUrl("");
  };

  const avatarPreview = pendingFile ? previewUrl : avatarUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          onReset={() => form.reset()}
        >
          <DialogHeader>
            <DialogTitle>Create Author</DialogTitle>
            <DialogDescription>
              Add a new author to the platform.
            </DialogDescription>
            <div className="mt-2">
              {isAdmin === undefined ? (
                <Badge variant="outline" className="gap-1.5">
                  <LoaderIcon className="h-3 w-3 animate-spin" />
                  Checking...
                </Badge>
              ) : isAdmin ? (
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
            <form.Field name="name">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">Name</Label>
                  <InputWithIcon
                    icon={<UserIcon />}
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Gabriel García Márquez"
                    required
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-xs text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Avatar</Label>
              <div className="flex items-center gap-3">
                <AvatarPreview url={avatarPreview} />
                <ImageDropzone
                  onDrop={handleDrop}
                  isUploading={isUploading}
                  className="px-4 py-3 flex-1"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span className="inline-flex items-center gap-1">
                  <Link2Icon className="h-3 w-3" />
                  or use a URL
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <InputWithIcon
                    icon={<ImageIcon />}
                    value={avatarUrl}
                    onChange={(e) => {
                      if (pendingFile) {
                        handleClearAvatar();
                      }
                      setAvatarUrl(e.target.value);
                    }}
                    placeholder="https://example.com/avatar.jpg"
                    type="url"
                    disabled={!!pendingFile}
                  />
                </div>
                {(avatarUrl.trim() || pendingFile) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearAvatar}
                    aria-label="Remove avatar"
                    disabled={isUploading}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <form.Field name="bio">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">Bio</Label>
                  <TextareaWithIcon
                    icon={<FileTextIcon />}
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Author biography"
                    rows={3}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <form.Subscribe>
              {(state) => (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={state.isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!state.canSubmit || state.isSubmitting}>
                    {state.isSubmitting ? "Creating..." : "Create Author"}
                  </Button>
                </>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
