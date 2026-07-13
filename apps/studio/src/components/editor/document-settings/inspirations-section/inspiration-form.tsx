import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { buttonVariants } from "@elcokiin/ui/button";
import emojiList from "@elcokiin/ui/emoji-list";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { cn } from "@elcokiin/ui/lib/utils";
import { Textarea } from "@elcokiin/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type InspirationFormValues = {
  emoji: string;
  title: string;
  url: string;
  author: string;
  note: string;
};

type InspirationFormProps = {
  documentId: Id<"documents">;
  index?: number;
  initialValues?: InspirationFormValues;
  onDone: () => void;
  onCancel: () => void;
  submitLabel?: string;
};

export function InspirationForm({
  documentId,
  index,
  initialValues,
  onDone,
  onCancel,
  submitLabel = "Add Inspiration",
}: InspirationFormProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const addInspiration = useMutation(api.documents.mutations.addInspiration);
  const updateInspiration = useMutation(api.documents.mutations.updateInspiration);

  const form = useForm({
    defaultValues: initialValues ?? {
      emoji: emojiList[Math.floor(Math.random() * emojiList.length)].emoji,
      title: "",
      url: "",
      author: "",
      note: "",
    },
    onSubmit: async ({ value }) => {
      const title = value.title.trim() || "Untitled";
      const inspiration = {
        emoji: value.emoji,
        title,
        url: value.url || undefined,
        author: value.author || undefined,
        note: value.note || undefined,
      };

      try {
        if (index !== undefined) {
          await updateInspiration({ documentId, index, inspiration });
        } else {
          await addInspiration({ documentId, inspiration });
        }
        onDone();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save inspiration";
        toast.error(message);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="rounded-xl border bg-muted/20 p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <form.Field name="emoji">
            {(field) => (
              <span className="select-none text-2xl leading-none">
                {field.state.value}
              </span>
            )}
          </form.Field>
          <button
            type="button"
            onClick={() => form.setFieldValue("emoji", emojiList[Math.floor(Math.random() * emojiList.length)].emoji)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "cursor-pointer opacity-50 transition-opacity hover:opacity-100",
            )}
            title="Random emoji"
          >
            🎲
          </button>
        </div>
        <div className="flex-1">
          <form.Field name="title">
            {(field) => (
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="What inspired you?"
                className="h-9 border-0 bg-transparent px-0 text-base font-medium shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
                autoFocus
              />
            )}
          </form.Field>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen(!detailsOpen)}
        className="mb-3 flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRightIcon
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            detailsOpen && "rotate-90",
          )}
        />
        More details
      </button>

      {detailsOpen && (
        <div className="mb-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">URL</Label>
            <form.Field name="url">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://example.com/article"
                  type="url"
                />
              )}
            </form.Field>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Author</Label>
            <form.Field name="author">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Name of the author"
                />
              )}
            </form.Field>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Note</Label>
            <form.Field name="note">
              {(field) => (
                <Textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Why was this inspiring?"
                  className="min-h-[60px]"
                />
              )}
            </form.Field>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "cursor-pointer",
          )}
        >
          Cancel
        </button>
        <form.Subscribe>
          {(state) => (
            <button
              type="submit"
              disabled={state.isSubmitting}
              className={cn(buttonVariants({ size: "sm" }), "cursor-pointer")}
            >
              {state.isSubmitting ? "Saving..." : submitLabel}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
