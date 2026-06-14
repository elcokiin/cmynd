import { useEffect } from "react";
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
import { Label } from "@elcokiin/ui/label";
import { UserIcon, ImageIcon, FileTextIcon, CheckIcon, ClockIcon, LoaderIcon } from "lucide-react";

import { InputWithIcon, TextareaWithIcon } from "@/components/ui/input-with-icon";
import { useErrorHandler } from "@/hooks/use-error-handler";

const createAuthorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().max(500, "Bio must be under 500 characters"),
  avatarUrl: z.string().url("Must be a valid URL").or(z.literal("")),
});

type CreateAuthorFormValues = z.infer<typeof createAuthorSchema>;

interface CreateAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (name: string) => void;
}

export function CreateAuthorDialog({ open, onOpenChange, onSuccess }: CreateAuthorDialogProps) {
  const { handleError } = useErrorHandler();
  const createAuthor = useMutation(api.authors.mutations.createAuthor);
  const isAdmin = useQuery(api.auth.isCurrentUserAdmin);

  const form = useForm({
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
    } as CreateAuthorFormValues,
    validators: {
      onSubmit: createAuthorSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const name = value.name.trim();
        await createAuthor({
          name,
          bio: value.bio?.trim() || undefined,
          avatarUrl: value.avatarUrl?.trim() || undefined,
        });
        onOpenChange(false);
        onSuccess?.(name);
        form.reset();
      } catch (error) {
        handleError(error, { context: "CreateAuthorDialog.handleSubmit" });
      }
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open]);

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

            <form.Field name="avatarUrl">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">Avatar</Label>
                  <div className="flex items-center gap-3">
                    {field.state.value?.trim() && (
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-full border bg-muted">
                        <img
                          src={field.state.value.trim()}
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
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      type="url"
                      className="flex-1"
                    />
                  </div>
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-xs text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

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
