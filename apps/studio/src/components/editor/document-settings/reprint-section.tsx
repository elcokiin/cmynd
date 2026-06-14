import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Label } from "@elcokiin/ui/label";
import { Switch } from "@elcokiin/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@elcokiin/ui/tooltip";
import { cn } from "@elcokiin/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
import {
  BadgeIcon,
  BookOpenIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  LanguagesIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useDebouncedSave } from "@/hooks/use-debounced-save";
import { useErrorHandler } from "@/hooks/use-error-handler";

import { AuthorSelectDialog } from "@/components/authors/author-select-dialog";
import { InputWithIcon, TextareaWithIcon } from "@/components/ui/input-with-icon";

type ReprintFormValues = {
  originalAuthor: string;
  originalAuthorId: Id<"authors"> | "";
  originalTitle: string;
  originalDate: string;
  sourceUrl: string;
  license: string;
  translator: string;
  reprintNotes: string;
};

type ReprintSectionProps = {
  documentId: Id<"documents">;
};

function normalizeOptionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function ReprintSection({ documentId }: ReprintSectionProps) {
  const { handleError } = useErrorHandler();

  const document = useQuery(api.documents.queries.getForEdit, { documentId });

  const updateType = useMutation(api.documents.mutations.updateType);
  const updateReprint = useMutation(api.documents.mutations.updateReprint);

  const isReprint = document?.type === "reprint";
  const isInspiration = document?.type === "inspiration";

  const [localIsReprint, setLocalIsReprint] = useState(false);
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);

  const form = useForm({
    defaultValues: {
      originalAuthor: "",
      originalAuthorId: "",
      originalTitle: "",
      originalDate: "",
      sourceUrl: "",
      license: "",
      translator: "",
      reprintNotes: "",
    } as ReprintFormValues,
    onSubmit: async ({ value }) => {
      try {
        await updateReprint({
          documentId,
          reprint: {
            originalAuthor: value.originalAuthor.trim() || "(unknown)",
            originalAuthorId: value.originalAuthorId || undefined,
            originalTitle: normalizeOptionalText(value.originalTitle),
            originalDate: value.originalDate ? Number(value.originalDate) : undefined,
            sourceUrl: normalizeOptionalText(value.sourceUrl),
            license: normalizeOptionalText(value.license),
            translator: normalizeOptionalText(value.translator),
            notes: normalizeOptionalText(value.reprintNotes),
          },
        });
      } catch (error) {
        handleError(error, {
          context: "ReprintSection.saveReprint",
        });
      }
    },
  });

  useEffect(() => {
    if (!document) return;
    setLocalIsReprint(document.type === "reprint");
    form.reset({
      originalAuthor: document.reprint?.originalAuthor ?? "",
      originalAuthorId: document.reprint?.originalAuthorId ?? "",
      originalTitle: document.reprint?.originalTitle ?? "",
      originalDate: document.reprint?.originalDate
        ? String(document.reprint.originalDate)
        : "",
      sourceUrl: document.reprint?.sourceUrl ?? "",
      license: document.reprint?.license ?? "",
      translator: document.reprint?.translator ?? "",
      reprintNotes: document.reprint?.notes ?? "",
    });
  }, [document]);

  const handleToggleReprint = async (checked: boolean) => {
    setLocalIsReprint(checked);
    try {
      await updateType({
        documentId,
        type: checked ? "reprint" : "own",
      });
    } catch (error) {
      setLocalIsReprint(!checked);
      handleError(error, {
        context: "ReprintSection.handleToggleReprint",
      });
    }
  };

  const save = useDebouncedSave(async () => {
    await form.handleSubmit();
  }, 700);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium mb-1">Reprint</h3>
          <p className="text-sm text-muted-foreground">
            Mark this document as a reprint if the content was
            originally written by another author.
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Switch
              id="reprint-toggle"
              checked={localIsReprint}
              onCheckedChange={handleToggleReprint}
              disabled={isInspiration}
            />
          </TooltipTrigger>
          {isInspiration && (
            <TooltipContent>
              Inspiration documents cannot be changed to reprint.
              Change the document type to Original first.
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="originalAuthor">
          {(field) => (
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium"
                >
                  Original Author{" "}
                  <span className="text-destructive">*</span>
                </Label>
                {isReprint && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setShowAuthorDialog(true)}
                  >
                    <SearchIcon className="h-3 w-3 mr-1" />
                    Search Existing
                  </Button>
                )}
              </div>
              {isReprint ? (
                <div className="relative">
                  <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <div
                    className={cn(
                      "w-full pl-8 pr-3 py-2 text-sm rounded-md border cursor-pointer",
                      "bg-background placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    )}
                    onClick={() => setShowAuthorDialog(true)}
                  >
                    {field.state.value || "Select an author..."}
                  </div>
                </div>
              ) : (
                <InputWithIcon
                  icon={<UserIcon className="h-4 w-4" />}
                  disabled
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    save();
                  }}
                  placeholder="e.g. Gabriel García Márquez"
                />
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="originalTitle">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium"
              >
                Original Title
              </Label>
              <InputWithIcon
                icon={<BookOpenIcon className="h-4 w-4" />}
                disabled={!isReprint}
                id={field.name}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  save();
                }}
                placeholder="e.g. Cien años de soledad"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="originalDate">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium"
              >
                Original Year
              </Label>
              <InputWithIcon
                icon={<CalendarIcon className="h-4 w-4" />}
                disabled={!isReprint}
                id={field.name}
                type="number"
                min={0}
                max={2100}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  save();
                }}
                placeholder="e.g. 1967"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="sourceUrl">
          {(field) => (
            <div className="space-y-2 sm:col-span-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium"
              >
                Source URL
              </Label>
              <InputWithIcon
                icon={<GlobeIcon className="h-4 w-4" />}
                disabled={!isReprint}
                id={field.name}
                type="url"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  save();
                }}
                placeholder="e.g. https://example.com/original-work"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="license">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                License
              </Label>
              <InputWithIcon
                icon={<BadgeIcon className="h-4 w-4" />}
                disabled={!isReprint}
                id={field.name}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  save();
                }}
                placeholder="e.g. Public Domain"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="translator">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium"
              >
                Translator
              </Label>
              <InputWithIcon
                icon={<LanguagesIcon className="h-4 w-4" />}
                disabled={!isReprint}
                id={field.name}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  save();
                }}
                placeholder="e.g. Gregory Rabassa"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="reprintNotes">
          {(field) => (
            <div className="space-y-2 sm:col-span-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium"
              >
                Notes
              </Label>
              <TextareaWithIcon
                icon={<FileTextIcon className="h-4 w-4" />}
                disabled={!isReprint}
                id={field.name}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  save();
                }}
                placeholder="Additional context, acknowledgments, or notes about this reprint..."
              />
            </div>
          )}
        </form.Field>
      </div>

      <AuthorSelectDialog
        open={showAuthorDialog}
        onSelect={(name, id) => {
          form.setFieldValue("originalAuthor", name);
          form.setFieldValue("originalAuthorId", id ?? "");
          save();
        }}
        onClose={() => setShowAuthorDialog(false)}
      />
    </div>
  );
}
