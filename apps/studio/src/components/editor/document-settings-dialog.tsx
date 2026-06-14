import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { DocumentType } from "@elcokiin/backend/lib/types/documents";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@elcokiin/ui/dialog";
import { Label } from "@elcokiin/ui/label";
import { Switch } from "@elcokiin/ui/switch";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@elcokiin/ui/tooltip";
import { cn } from "@elcokiin/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import {
  XIcon,
  ImageIcon,
  BookOpenIcon,
  LinkIcon,
  DownloadIcon,
  SettingsIcon,
  SparklesIcon,
  TextIcon,
  UserIcon,
  GlobeIcon,
  BadgeIcon,
  LanguagesIcon,
  FileTextIcon,
  CalendarIcon,
} from "lucide-react";

import { useErrorHandler } from "@/hooks/use-error-handler";

type DocumentSettingsDialogProps = {
  documentId: Id<"documents">;
  currentType?: DocumentType;
  onExportMarkdown?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type NavigationSection = "cover" | "reprint" | "inspirations" | "export";

type CoverConfigTab = "image" | "prompt" | "description";

export function DocumentSettingsDialog({
  documentId,
  onExportMarkdown,
  open,
  onOpenChange,
}: DocumentSettingsDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] =
    useState<NavigationSection>("cover");
  const [activeCoverTab, setActiveCoverTab] = useState<CoverConfigTab>("image");
  const [coverImagePrompt, setCoverImagePrompt] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleError } = useErrorHandler();

  const document = useQuery(api.documents.queries.getForEdit, { documentId });
  const coverImageUrl = useQuery(
    api.storage.getUrl,
    document?.coverImageId ? { storageId: document.coverImageId } : "skip",
  );

  const updateCoverImage = useMutation(
    api.documents.mutations.updateCoverImage,
  );
  const updateMetadata = useMutation(api.documents.mutations.updateMetadata);
  const updateReprint = useMutation(api.documents.mutations.updateReprint);
  const updateType = useMutation(api.documents.mutations.updateType);
  const deleteFile = useMutation(api.storage.deleteFile);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const isReprint = document?.type === "reprint";
  const isInspiration = document?.type === "inspiration";

  const [originalAuthor, setOriginalAuthor] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [license, setLicense] = useState("");
  const [translator, setTranslator] = useState("");
  const [reprintNotes, setReprintNotes] = useState("");

  const handleToggleReprint = async (checked: boolean) => {
    try {
      await updateType({
        documentId,
        type: checked ? "reprint" : "own",
      });
    } catch (error) {
      handleError(error, {
        context: "DocumentSettingsDialog.handleToggleReprint",
      });
    }
  };

  useEffect(() => {
    if (!open || !document) return;
    setCoverImagePrompt(document.coverImagePrompt ?? "");
    setDescription(document.description ?? "");
    setOriginalAuthor(document.reprint?.originalAuthor ?? "");
    setOriginalTitle(document.reprint?.originalTitle ?? "");
    setOriginalDate(document.reprint?.originalDate ? String(document.reprint.originalDate) : "");
    setSourceUrl(document.reprint?.sourceUrl ?? "");
    setLicense(document.reprint?.license ?? "");
    setTranslator(document.reprint?.translator ?? "");
    setReprintNotes(document.reprint?.notes ?? "");
  }, [open, document?._id, document?.coverImagePrompt, document?.description, document?.reprint]);

  const normalizeOptionalText = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const saveMetadataDebounced = useDebouncedCallback(
    async (field: "coverImagePrompt" | "description", value: string) => {
      try {
        const normalized = normalizeOptionalText(value);
        if (field === "coverImagePrompt") {
          await updateMetadata({
            documentId,
            coverImagePrompt: normalized,
          });
          return;
        }

        await updateMetadata({
          documentId,
          description: normalized,
        });
      } catch (error) {
        handleError(error, {
          context: `DocumentSettingsDialog.saveMetadata.${field}`,
        });
      }
    },
    700,
  );

  const saveReprintDebounced = useDebouncedCallback(
    async () => {
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
          context: "DocumentSettingsDialog.saveReprint",
        });
      }
    },
    700,
  );

  const handlePromptChange = (value: string) => {
    setCoverImagePrompt(value);
    saveMetadataDebounced("coverImagePrompt", value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    saveMetadataDebounced("description", value);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      // Delete existing cover image if any
      if (document?.coverImageId) {
        await deleteFile({ storageId: document.coverImageId });
      }

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const { storageId } = await result.json();

      await updateCoverImage({
        documentId,
        coverImageId: storageId as Id<"_storage">,
      });

      toast.success("Cover image updated");
    } catch (error) {
      handleError(error, {
        context: "DocumentSettingsDialog.handleImageUpload",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveCoverImage = async () => {
    if (!document?.coverImageId) return;

    try {
      await deleteFile({ storageId: document.coverImageId });
      await updateCoverImage({
        documentId,
        coverImageId: undefined,
      });
      toast.success("Cover image removed");
    } catch (error) {
      handleError(error, {
        context: "DocumentSettingsDialog.handleRemoveCoverImage",
      });
    }
  };

  const navItems = [
    { id: "cover" as const, label: "Cover", icon: ImageIcon },
    { id: "reprint" as const, label: "Reprint", icon: BookOpenIcon },
    { id: "inspirations" as const, label: "Inspirations", icon: LinkIcon },
    ...(onExportMarkdown
      ? [{ id: "export" as const, label: "Export", icon: DownloadIcon }]
      : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:!max-w-4xl p-0 gap-0 h-[76vh]">
        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-56 border-r bg-muted/30 p-4 flex flex-col gap-1">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-sm font-medium">
                Settings
              </DialogTitle>
            </DialogHeader>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                    activeSection === item.id
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === "cover" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Cover Image</h3>
                  <p className="text-sm text-muted-foreground">
                    Add a cover image that will be displayed on your document
                    card. A cover image is required to submit for review.
                  </p>
                </div>

                <div className="inline-flex items-center rounded-md border bg-muted/20 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveCoverTab("image")}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm transition-colors",
                      activeCoverTab === "image"
                        ? "bg-background shadow-sm font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCoverTab("prompt")}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm transition-colors",
                      activeCoverTab === "prompt"
                        ? "bg-background shadow-sm font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCoverTab("description")}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm transition-colors",
                      activeCoverTab === "description"
                        ? "bg-background shadow-sm font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <TextIcon className="h-4 w-4" />
                    Description
                  </button>
                </div>

                {activeCoverTab === "image" && (
                  <div className="space-y-4">
                    {coverImageUrl ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={coverImageUrl}
                          alt="Cover"
                          className="h-full w-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2 h-8 w-8"
                          onClick={handleRemoveCoverImage}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/50 hover:bg-muted/70 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="rounded-full bg-background p-3 shadow-sm">
                          {isUploading ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {isUploading
                            ? "Uploading..."
                            : "Click to upload cover image"}
                        </div>
                        <div className="text-xs text-muted-foreground/70">
                          Recommended: 1200 x 630 pixels
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </div>
                )}

                {activeCoverTab === "prompt" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Coming soon: auto-generated prompts and image generation inside the blog. Save the prompt used to generate this image.
                    </p>
                    <textarea
                      value={coverImagePrompt}
                      onChange={(event) =>
                        handlePromptChange(event.target.value)
                      }
                      placeholder="e.g. cinematic street photo, golden hour, 50mm lens, high detail"
                      className={cn(
                        "w-full min-h-[220px] p-3 text-sm rounded-md border resize-y",
                        "bg-background placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      )}
                    />
                  </div>
                )}

                {activeCoverTab === "description" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Add a short summary for this document. Optional.
                    </p>
                    <textarea
                      value={description}
                      onChange={(event) =>
                        handleDescriptionChange(event.target.value)
                      }
                      placeholder="Write a concise summary of what this document covers..."
                      className={cn(
                        "w-full min-h-[220px] p-3 text-sm rounded-md border resize-y",
                        "bg-background placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {activeSection === "reprint" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Reprint</h3>
                    <p className="text-sm text-muted-foreground">
                      Mark this document as a reprint if the content was originally
                      written by another author.
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="reprint-toggle" className="text-sm cursor-pointer select-none">
                          This is a reprint
                        </Label>
                        <Switch
                          id="reprint-toggle"
                          checked={isReprint}
                          onCheckedChange={handleToggleReprint}
                          disabled={isInspiration}
                        />
                      </div>
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
                    <Label htmlFor="originalAuthor" className="text-sm font-medium">
                      Original Author <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <UserIcon className={cn("absolute left-2.5 top-2.5 h-4 w-4", isReprint ? "text-muted-foreground" : "text-muted-foreground/30")} />
                      <input
                        id="originalAuthor"
                        value={originalAuthor}
                        onChange={(e) => { setOriginalAuthor(e.target.value); saveReprintDebounced(); }}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalTitle" className="text-sm font-medium">
                      Original Title
                    </Label>
                    <div className="relative">
                      <BookOpenIcon className={cn("absolute left-2.5 top-2.5 h-4 w-4", isReprint ? "text-muted-foreground" : "text-muted-foreground/30")} />
                      <input
                        id="originalTitle"
                        value={originalTitle}
                        onChange={(e) => { setOriginalTitle(e.target.value); saveReprintDebounced(); }}
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
                    <Label htmlFor="originalDate" className="text-sm font-medium">
                      Original Year
                    </Label>
                    <div className="relative">
                      <CalendarIcon className={cn("absolute left-2.5 top-2.5 h-4 w-4", isReprint ? "text-muted-foreground" : "text-muted-foreground/30")} />
                      <input
                        id="originalDate"
                        type="number"
                        min={0}
                        max={2100}
                        value={originalDate}
                        onChange={(e) => { setOriginalDate(e.target.value); saveReprintDebounced(); }}
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
                    <Label htmlFor="sourceUrl" className="text-sm font-medium">
                      Source URL
                    </Label>
                    <div className="relative">
                      <GlobeIcon className={cn("absolute left-2.5 top-2.5 h-4 w-4", isReprint ? "text-muted-foreground" : "text-muted-foreground/30")} />
                      <input
                        id="sourceUrl"
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => { setSourceUrl(e.target.value); saveReprintDebounced(); }}
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
                      <BadgeIcon className={cn("absolute left-2.5 top-2.5 h-4 w-4", isReprint ? "text-muted-foreground" : "text-muted-foreground/30")} />
                      <input
                        id="license"
                        value={license}
                        onChange={(e) => { setLicense(e.target.value); saveReprintDebounced(); }}
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
                    <Label htmlFor="translator" className="text-sm font-medium">
                      Translator
                    </Label>
                    <div className="relative">
                      <LanguagesIcon className={cn("absolute left-2.5 top-2.5 h-4 w-4", isReprint ? "text-muted-foreground" : "text-muted-foreground/30")} />
                      <input
                        id="translator"
                        value={translator}
                        onChange={(e) => { setTranslator(e.target.value); saveReprintDebounced(); }}
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
                    <Label htmlFor="reprintNotes" className="text-sm font-medium">
                      Notes
                    </Label>
                    <div className="relative">
                      <FileTextIcon className={cn("absolute left-2.5 top-2.5 h-4 w-4", isReprint ? "text-muted-foreground" : "text-muted-foreground/30")} />
                      <textarea
                        id="reprintNotes"
                        value={reprintNotes}
                        onChange={(e) => { setReprintNotes(e.target.value); saveReprintDebounced(); }}
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
              </div>
            )}

            {activeSection === "inspirations" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Inspirations</h3>
                  <p className="text-sm text-muted-foreground">
                    Add links and sources that inspired you.
                  </p>
                </div>
                <div className="flex items-center justify-center h-48 rounded-lg border border-dashed bg-muted/30">
                  <div className="text-center">
                    <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      This feature is still being built.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "export" && onExportMarkdown && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Download your document as a Markdown file.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onExportMarkdown}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export as .md
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ButtonSettingsProps = {
  documentId: Id<"documents"> | null;
  currentType?: DocumentType;
  onExportMarkdown?: () => void;
};

export function ButtonSettings({
  documentId,
  onExportMarkdown,
}: ButtonSettingsProps): React.ReactNode {
  const [open, setOpen] = useState(false);

  const isDisabled = !documentId;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={isDisabled}
        title={isDisabled ? "Save document first" : "Document settings"}
      >
        <SettingsIcon className="h-4 w-4" />
      </Button>
      {documentId && (
        <DocumentSettingsDialog
          documentId={documentId}
          onExportMarkdown={onExportMarkdown}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
