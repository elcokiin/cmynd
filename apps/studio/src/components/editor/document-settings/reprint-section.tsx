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
import { useDebouncedCallback } from "use-debounce";

import { useErrorHandler } from "@/hooks/use-error-handler";

import { AuthorSelectDialog } from "./author-select-dialog";

type ReprintSectionProps = {
  documentId: Id<"documents">;
};

export function ReprintSection({ documentId }: ReprintSectionProps) {
  const { handleError } = useErrorHandler();

  const document = useQuery(api.documents.queries.getForEdit, { documentId });

  const updateType = useMutation(api.documents.mutations.updateType);
  const updateReprint = useMutation(api.documents.mutations.updateReprint);

  const isReprint = document?.type === "reprint";
  const isInspiration = document?.type === "inspiration";

  const [localIsReprint, setLocalIsReprint] = useState(false);
  const [originalAuthor, setOriginalAuthor] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [license, setLicense] = useState("");
  const [translator, setTranslator] = useState("");
  const [reprintNotes, setReprintNotes] = useState("");
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);

  useEffect(() => {
    if (!document) return;
    setLocalIsReprint(document.type === "reprint");
    setOriginalAuthor(document.reprint?.originalAuthor ?? "");
    setOriginalTitle(document.reprint?.originalTitle ?? "");
    setOriginalDate(
      document.reprint?.originalDate
        ? String(document.reprint.originalDate)
        : "",
    );
    setSourceUrl(document.reprint?.sourceUrl ?? "");
    setLicense(document.reprint?.license ?? "");
    setTranslator(document.reprint?.translator ?? "");
    setReprintNotes(document.reprint?.notes ?? "");
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

  const normalizeOptionalText = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const saveReprintDebounced = useDebouncedCallback(async () => {
    try {
      await updateReprint({
        documentId,
        reprint: {
          originalAuthor: originalAuthor.trim() || "(unknown)",
          originalTitle: normalizeOptionalText(originalTitle),
          originalDate: originalDate ? Number(originalDate) : undefined,
          sourceUrl: normalizeOptionalText(sourceUrl),
          license: normalizeOptionalText(license),
          translator: normalizeOptionalText(translator),
          notes: normalizeOptionalText(reprintNotes),
        },
      });
    } catch (error) {
      handleError(error, {
        context: "ReprintSection.saveReprint",
      });
    }
  }, 700);

  useEffect(() => {
    return () => {
      saveReprintDebounced.flush();
    };
  }, [saveReprintDebounced]);

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
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="originalAuthor"
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
              <UserIcon
                className={cn(
                  "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground",
                )}
              />
              <div
                className={cn(
                  "w-full pl-8 pr-3 py-2 text-sm rounded-md border cursor-pointer",
                  "bg-background placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  !isReprint && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => setShowAuthorDialog(true)}
              >
                {originalAuthor || "Select an author..."}
              </div>
            </div>
          ) : (
            <div className="relative">
              <UserIcon
                className={cn(
                  "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/30",
                )}
              />
              <input
                id="originalAuthor"
                value={originalAuthor}
                onChange={(e) => {
                  setOriginalAuthor(e.target.value);
                  saveReprintDebounced();
                }}
                disabled={!isReprint}
                placeholder="e.g. Gabriel García Márquez"
                className={cn(
                  "w-full pl-8 pr-3 py-2 text-sm rounded-md border",
                  "bg-background placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  !isReprint && "opacity-50 cursor-not-allowed",
                )}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="originalTitle"
            className="text-sm font-medium"
          >
            Original Title
          </Label>
          <div className="relative">
            <BookOpenIcon
              className={cn(
                "absolute left-2.5 top-2.5 h-4 w-4",
                isReprint
                  ? "text-muted-foreground"
                  : "text-muted-foreground/30",
              )}
            />
            <input
              id="originalTitle"
              value={originalTitle}
              onChange={(e) => {
                setOriginalTitle(e.target.value);
                saveReprintDebounced();
              }}
              disabled={!isReprint}
              placeholder="e.g. Cien años de soledad"
              className={cn(
                "w-full pl-8 pr-3 py-2 text-sm rounded-md border",
                "bg-background placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !isReprint && "opacity-50 cursor-not-allowed",
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="originalDate"
            className="text-sm font-medium"
          >
            Original Year
          </Label>
          <div className="relative">
            <CalendarIcon
              className={cn(
                "absolute left-2.5 top-2.5 h-4 w-4",
                isReprint
                  ? "text-muted-foreground"
                  : "text-muted-foreground/30",
              )}
            />
            <input
              id="originalDate"
              type="number"
              min={0}
              max={2100}
              value={originalDate}
              onChange={(e) => {
                setOriginalDate(e.target.value);
                saveReprintDebounced();
              }}
              disabled={!isReprint}
              placeholder="e.g. 1967"
              className={cn(
                "w-full pl-8 pr-3 py-2 text-sm rounded-md border",
                "bg-background placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !isReprint && "opacity-50 cursor-not-allowed",
              )}
            />
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="sourceUrl"
            className="text-sm font-medium"
          >
            Source URL
          </Label>
          <div className="relative">
            <GlobeIcon
              className={cn(
                "absolute left-2.5 top-2.5 h-4 w-4",
                isReprint
                  ? "text-muted-foreground"
                  : "text-muted-foreground/30",
              )}
            />
            <input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => {
                setSourceUrl(e.target.value);
                saveReprintDebounced();
              }}
              disabled={!isReprint}
              placeholder="e.g. https://example.com/original-work"
              className={cn(
                "w-full pl-8 pr-3 py-2 text-sm rounded-md border",
                "bg-background placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !isReprint && "opacity-50 cursor-not-allowed",
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="license" className="text-sm font-medium">
            License
          </Label>
          <div className="relative">
            <BadgeIcon
              className={cn(
                "absolute left-2.5 top-2.5 h-4 w-4",
                isReprint
                  ? "text-muted-foreground"
                  : "text-muted-foreground/30",
              )}
            />
            <input
              id="license"
              value={license}
              onChange={(e) => {
                setLicense(e.target.value);
                saveReprintDebounced();
              }}
              disabled={!isReprint}
              placeholder="e.g. Public Domain"
              className={cn(
                "w-full pl-8 pr-3 py-2 text-sm rounded-md border",
                "bg-background placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !isReprint && "opacity-50 cursor-not-allowed",
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="translator"
            className="text-sm font-medium"
          >
            Translator
          </Label>
          <div className="relative">
            <LanguagesIcon
              className={cn(
                "absolute left-2.5 top-2.5 h-4 w-4",
                isReprint
                  ? "text-muted-foreground"
                  : "text-muted-foreground/30",
              )}
            />
            <input
              id="translator"
              value={translator}
              onChange={(e) => {
                setTranslator(e.target.value);
                saveReprintDebounced();
              }}
              disabled={!isReprint}
              placeholder="e.g. Gregory Rabassa"
              className={cn(
                "w-full pl-8 pr-3 py-2 text-sm rounded-md border",
                "bg-background placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !isReprint && "opacity-50 cursor-not-allowed",
              )}
            />
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="reprintNotes"
            className="text-sm font-medium"
          >
            Notes
          </Label>
          <div className="relative">
            <FileTextIcon
              className={cn(
                "absolute left-2.5 top-2.5 h-4 w-4",
                isReprint
                  ? "text-muted-foreground"
                  : "text-muted-foreground/30",
              )}
            />
            <textarea
              id="reprintNotes"
              value={reprintNotes}
              onChange={(e) => {
                setReprintNotes(e.target.value);
                saveReprintDebounced();
              }}
              disabled={!isReprint}
              placeholder="Additional context, acknowledgments, or notes about this reprint..."
              className={cn(
                "w-full pl-8 pr-3 py-2 text-sm rounded-md border resize-y min-h-[80px]",
                "bg-background placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                !isReprint && "opacity-50 cursor-not-allowed",
              )}
            />
          </div>
        </div>
      </div>

      <AuthorSelectDialog
        open={showAuthorDialog}
        onSelect={(name) => setOriginalAuthor(name)}
        onClose={() => setShowAuthorDialog(false)}
      />
    </div>
  );
}
