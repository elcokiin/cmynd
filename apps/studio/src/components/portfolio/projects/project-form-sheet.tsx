import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useConvex } from "convex/react";
import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { Switch } from "@elcokiin/ui/switch";
import { Badge } from "@elcokiin/ui/badge";
import { TextareaWithIcon } from "@/components/ui/input-with-icon";
import { TagsInput } from "@/components/ui/tags-input";
import {
  PortfolioField,
  getPortfolioFieldState,
} from "@/components/portfolio/portfolio-field";
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
    validators: {
      onChange: projectSchema as any,
      onSubmit: projectSchema as any,
    },
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
            <form.Field
              name="title"
              validators={{
                onChange: projectSchema.shape.title,
                onBlur: projectSchema.shape.title,
              }}
            >
              {(field) => {
                const { errors, invalid, showErrors } = getPortfolioFieldState(field);
                return (
                  <PortfolioField
                    label="Title"
                    htmlFor={field.name}
                    required
                    errors={errors}
                    showErrors={showErrors}
                  >
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
                      onBlur={field.handleBlur}
                      placeholder="Project title"
                      aria-invalid={invalid || undefined}
                      required
                    />
                  </PortfolioField>
                );
              }}
            </form.Field>

            <form.Field
              name="slug"
              validators={{
                onChange: projectSchema.shape.slug,
                onBlur: projectSchema.shape.slug,
              }}
            >
              {(field) => {
                const { errors, invalid, showErrors } = getPortfolioFieldState(field);
                return (
                  <PortfolioField
                    label={
                      <>
                        Slug
                        {!slugManuallyEdited.current && !editingProject && field.state.value && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground">
                            <SparklesIcon className="h-2.5 w-2.5 mr-0.5" />
                            Auto
                          </Badge>
                        )}
                      </>
                    }
                    htmlFor={field.name}
                    required
                    errors={errors}
                    showErrors={showErrors}
                  >
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => {
                        slugManuallyEdited.current = true;
                        field.handleChange(e.target.value);
                      }}
                      onBlur={field.handleBlur}
                      placeholder="project-slug"
                      aria-invalid={invalid || undefined}
                      required
                    />
                  </PortfolioField>
                );
              }}
            </form.Field>
          </div>

          <form.Field
            name="description"
            validators={{
              onChange: projectSchema.shape.description,
              onBlur: projectSchema.shape.description,
            }}
          >
            {(field) => {
              const { errors, invalid, showErrors } = getPortfolioFieldState(field);
              return (
                <PortfolioField
                  label="Description"
                  htmlFor={field.name}
                  description="A short summary of what the project is and does."
                  errors={errors}
                  showErrors={showErrors}
                >
                  <TextareaWithIcon
                    icon={<FileTextIcon />}
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Project description"
                    aria-invalid={invalid || undefined}
                    rows={3}
                  />
                </PortfolioField>
              );
            }}
          </form.Field>
        </div>

        <div className="space-y-5">
          <SectionHeader label="Narrative" />

          <form.Field
            name="philosophy"
            validators={{
              onChange: projectSchema.shape.philosophy,
              onBlur: projectSchema.shape.philosophy,
            }}
          >
            {(field) => {
              const { errors, invalid, showErrors } = getPortfolioFieldState(field);
              return (
                <PortfolioField
                  label="Philosophy"
                  htmlFor={field.name}
                  description="Share the motivation, design decisions, or guiding principles."
                  errors={errors}
                  showErrors={showErrors}
                >
                  <TextareaWithIcon
                    icon={<LightbulbIcon />}
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="The thinking behind this project"
                    aria-invalid={invalid || undefined}
                    rows={3}
                  />
                </PortfolioField>
              );
            }}
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
            <form.Field
              name="url"
              validators={{
                onChange: projectSchema.shape.url,
                onBlur: projectSchema.shape.url,
              }}
            >
              {(field) => {
                const { errors, invalid, showErrors } = getPortfolioFieldState(field);
                return (
                  <PortfolioField
                    label="Live URL"
                    htmlFor={field.name}
                    optional
                    description="Where visitors can try the project."
                    errors={errors}
                    showErrors={showErrors}
                  >
                    <div className="relative">
                      <GlobeIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="https://..."
                        type="url"
                        aria-invalid={invalid || undefined}
                        className="pl-8"
                      />
                    </div>
                  </PortfolioField>
                );
              }}
            </form.Field>

            <form.Field
              name="githubUrl"
              validators={{
                onChange: projectSchema.shape.githubUrl,
                onBlur: projectSchema.shape.githubUrl,
              }}
            >
              {(field) => {
                const { errors, invalid, showErrors } = getPortfolioFieldState(field);
                return (
                  <PortfolioField
                    label="GitHub URL"
                    htmlFor={field.name}
                    optional
                    description="Link to the source code."
                    errors={errors}
                    showErrors={showErrors}
                  >
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="https://github.com/..."
                      type="url"
                      aria-invalid={invalid || undefined}
                    />
                  </PortfolioField>
                );
              }}
            </form.Field>
          </div>
        </div>

        <div className="space-y-5">
          <SectionHeader label="Settings" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <form.Field
              name="order"
              validators={{
                onChange: projectSchema.shape.order,
                onBlur: projectSchema.shape.order,
              }}
            >
              {(field) => {
                const { errors, invalid, showErrors } = getPortfolioFieldState(field);
                return (
                  <PortfolioField
                    label="Order"
                    htmlFor={field.name}
                    description="Lower numbers appear first."
                    errors={errors}
                    showErrors={showErrors}
                  >
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      onBlur={field.handleBlur}
                      aria-invalid={invalid || undefined}
                      min={0}
                    />
                  </PortfolioField>
                );
              }}
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
