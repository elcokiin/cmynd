import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useConvex } from "convex/react";
import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Field, FieldLabel, FieldError } from "@elcokiin/ui/field";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { Switch } from "@elcokiin/ui/switch";
import { Badge } from "@elcokiin/ui/badge";
import { TextareaWithIcon } from "@/components/ui/input-with-icon";
import { TagsInput } from "@/components/ui/tags-input";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@elcokiin/ui/sheet";
import { Separator } from "@elcokiin/ui/separator";
import { useErrorHandler } from "@/hooks/use-error-handler";
import {
  ProjectImageManager,
  type PendingFileEntry,
} from "@/components/portfolio/projects/project-image-manager";
import { SkillPicker } from "@/components/portfolio/skill-picker";
import {
  FileTextIcon,
  LightbulbIcon,
  GlobeIcon,
  BrainCircuitIcon,
  SparklesIcon,
  ListChecksIcon,
  PuzzleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { normalizeOptionalText } from "@/lib/text";
import { generateSlug } from "@elcokiin/backend/lib/utils/slug";
import { projectSchema, defaultFormValues } from "./project-schema";
import type { AdminProject } from "@elcokiin/backend/lib/types/portfolio";

interface ProjectFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProject?: AdminProject;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Separator className="flex-1" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

export function ProjectFormSheet({ open, onOpenChange, editingProject }: ProjectFormSheetProps) {
  const { handleError } = useErrorHandler();
  const convex = useConvex();
  const createProject = useMutation(api.portfolio.mutations.createProject);
  const updateProject = useMutation(api.portfolio.mutations.updateProject);
  const deleteFile = useMutation(api.storage.deleteFile);
  const uploadFile = useUploadFile(api.r2);
  const allSkills = useQuery(api.portfolio.queries.listAllSkills);

  const [pendingFiles, setPendingFiles] = useState<PendingFileEntry[]>([]);
  const [removedStorageIds, setRemovedStorageIds] = useState<string[]>([]);
  const slugManuallyEdited = useRef(false);

  const wasOpen = useRef(open);

  useEffect(() => {
    if (open && !wasOpen.current) {
      slugManuallyEdited.current = !!editingProject;
      setPendingFiles([]);
      setRemovedStorageIds([]);
      form.reset(defaultFormValues(editingProject));
    }
    wasOpen.current = open;
  }, [open, editingProject]);

  const uploadPendingFiles = useCallback(async (): Promise<Array<{ storageId: string; url: string; alt?: string }>> => {
    if (pendingFiles.length === 0) return [];
    return Promise.all(
      pendingFiles.map(async (pf) => {
        const key = await uploadFile(pf.file);
        const url = await convex.query(api.storage.getCdnUrl, { key });
        return { storageId: key, url: url ?? "", alt: pf.alt || undefined };
      }),
    );
  }, [pendingFiles, uploadFile, convex]);

  const form = useForm({
    defaultValues: defaultFormValues(editingProject),
    validators: { onSubmit: projectSchema as any },
    onSubmit: async ({ value }) => {
      try {
        const uploadedImages = await uploadPendingFiles();
        const keptImages = value.images.filter(
          (img) => !img.storageId || !removedStorageIds.includes(img.storageId),
        );
        const allImages = [...keptImages, ...uploadedImages];

        const payload = {
          title: value.title,
          slug: value.slug,
          description: normalizeOptionalText(value.description ?? ""),
          philosophy: normalizeOptionalText(value.philosophy ?? ""),
          keyKnowledge: value.keyKnowledge.length > 0 ? value.keyKnowledge : undefined,
          keyFeatures: value.keyFeatures.length > 0 ? value.keyFeatures : undefined,
          url: normalizeOptionalText(value.url ?? ""),
          githubUrl: normalizeOptionalText(value.githubUrl ?? ""),
          skillLinks: value.skillLinks.length > 0 ? value.skillLinks : undefined,
          images: allImages.length > 0 ? allImages : undefined,
          order: value.order,
          isVisible: value.isVisible,
        };

        if (editingProject) {
          await updateProject({ _id: editingProject._id, ...payload });
          toast.success("Project updated");
        } else {
          await createProject(payload);
          toast.success("Project created");
        }

        await Promise.all(
          removedStorageIds.map((storageId) => deleteFile({ key: storageId })),
        );

        onOpenChange(false);
      } catch (error) {
        handleError(error, { context: "ProjectFormSheet.handleSubmit" });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col h-full"
    >
      <SheetHeader className="border-b pb-4 px-6">
        <SheetTitle>
          {editingProject ? "Edit Project" : "New Project"}
        </SheetTitle>
        <SheetDescription>
          {editingProject
            ? `Update "${editingProject.title}" — changes are saved immediately.`
            : "Add a new project to your portfolio."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <div className="space-y-5">
          <SectionHeader label="Basic Information" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <form.Field name="title">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Title <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      if (!slugManuallyEdited.current && !editingProject) {
                        const slug = generateSlug(e.target.value);
                        form.setFieldValue("slug", slug);
                      }
                    }}
                    placeholder="Project title"
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="slug">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Slug <span className="text-destructive">*</span>
                    {!slugManuallyEdited.current && !editingProject && field.state.value && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground">
                        <SparklesIcon className="h-2.5 w-2.5 mr-0.5" />
                        Auto
                      </Badge>
                    )}
                  </FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      slugManuallyEdited.current = true;
                      field.handleChange(e.target.value);
                    }}
                    placeholder="project-slug"
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </div>

          <form.Field name="description">
            {(field) => (
              <div className="grid gap-3">
                <Label>Description</Label>
                <TextareaWithIcon
                  icon={<FileTextIcon />}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Project description"
                  rows={3}
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="space-y-5">
          <SectionHeader label="Narrative" />

          <form.Field name="philosophy">
            {(field) => (
              <div className="grid gap-3">
                <Label>Philosophy</Label>
                <TextareaWithIcon
                  icon={<LightbulbIcon />}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="The thinking behind this project"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Share the motivation, design decisions, or guiding principles.
                </p>
              </div>
            )}
          </form.Field>
        </div>

        <div className="space-y-5">
          <SectionHeader label="Details" />

          <form.Field name="keyKnowledge">
            {(field) => (
              <div className="grid gap-3">
                <div className="flex items-center gap-1.5">
                  <BrainCircuitIcon className="h-4 w-4 text-muted-foreground" />
                  <Label>Key Knowledge</Label>
                </div>
                <div className="border-l-2 border-primary/20 pl-3">
                  <TagsInput
                    value={field.state.value}
                    onChange={field.handleChange}
                    placeholder="e.g. System Design, WebGL, State Machines"
                    className="border-primary/10 bg-primary/[0.02]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Core concepts and skills this project demonstrates.
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="keyFeatures">
            {(field) => (
              <div className="grid gap-3">
                <div className="flex items-center gap-1.5">
                  <ListChecksIcon className="h-4 w-4 text-muted-foreground" />
                  <Label>Key Features</Label>
                </div>
                <TagsInput
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder="e.g. Real-time Sync, Drag & Drop, PWA"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="skillLinks">
            {(field) => (
              <div className="grid gap-3">
                <div className="flex items-center gap-1.5">
                  <PuzzleIcon className="h-4 w-4 text-muted-foreground" />
                  <Label>Skills</Label>
                </div>
                <SkillPicker
                  skills={allSkills}
                  value={field.state.value}
                  onChange={field.handleChange}
                  withRole
                />
                <p className="text-xs text-muted-foreground">
                  Pick the skills this project demonstrates and mark which ones are core.
                </p>
              </div>
            )}
          </form.Field>
        </div>

        <div className="space-y-5">
          <SectionHeader label="Media" />

          <form.Field name="images">
            {(field) => (
              <ProjectImageManager
                images={field.state.value}
                onChange={field.handleChange}
                pendingFiles={pendingFiles}
                onPendingChange={setPendingFiles}
                removedStorageIds={removedStorageIds}
                onRemovedChange={setRemovedStorageIds}
              />
            )}
          </form.Field>
        </div>

        <div className="space-y-5">
          <SectionHeader label="Links" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <form.Field name="url">
              {(field) => (
                <div className="grid gap-3">
                  <Label>Live URL</Label>
                  <div className="relative">
                    <GlobeIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://..."
                      type="url"
                      className="pl-8"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="githubUrl">
              {(field) => (
                <div className="grid gap-3">
                  <Label>GitHub URL</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://github.com/..."
                    type="url"
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>

        <div className="space-y-5">
          <SectionHeader label="Settings" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <form.Field name="order">
              {(field) => (
                <div className="grid gap-3">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
                </div>
              )}
            </form.Field>

            <form.Field name="isVisible">
              {(field) => (
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                  <Label>Visible on portfolio</Label>
                </div>
              )}
            </form.Field>
          </div>
        </div>
      </div>

      <SheetFooter className="border-t pt-4">
        <form.Subscribe>
          {(state) => (
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                type="button"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={state.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={state.isSubmitting}>
                {state.isSubmitting
                  ? "Saving..."
                  : editingProject
                    ? "Update Project"
                    : "Create Project"}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </SheetFooter>
    </form>
  );
}
