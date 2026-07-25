import { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useMutation, useConvex } from "convex/react";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@elcokiin/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@elcokiin/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@elcokiin/ui/dialog";
import { Separator } from "@elcokiin/ui/separator";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ProjectImageManager, type PendingFileEntry } from "@/components/portfolio/project-image-manager";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  FolderKanbanIcon,
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

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { AdminProject } from "@elcokiin/backend/lib/types/portfolio";

interface ProjectsListProps {
  projects: AdminProject[] | undefined;
}

const projectImageSchema = z.object({
  storageId: z.string().optional(),
  url: z.string(),
  alt: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  philosophy: z.string().optional(),
  keyKnowledge: z.array(z.string()).optional().default([]),
  keyFeatures: z.array(z.string()).optional().default([]),
  url: z.string().optional(),
  githubUrl: z.string().optional(),
  technologies: z.array(z.string()).optional().default([]),
  images: z.array(projectImageSchema).optional().default([]),
  order: z.number().min(0),
  isVisible: z.boolean().optional().default(true),
});

function defaultFormValues(project?: AdminProject): z.infer<typeof projectSchema> {
  return {
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    description: project?.description ?? "",
    philosophy: project?.philosophy ?? "",
    keyKnowledge: project?.keyKnowledge ?? [],
    keyFeatures: project?.keyFeatures ?? [],
    url: project?.url ?? "",
    githubUrl: project?.githubUrl ?? "",
    technologies: project?.technologies ?? [],
    images: project?.images ?? [],
    order: project?.order ?? 0,
    isVisible: project?.isVisible ?? true,
  };
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

export function ProjectsList({ projects }: ProjectsListProps) {
  const { handleError } = useErrorHandler();
  const convex = useConvex();
  const createProject = useMutation(api.portfolio.mutations.createProject);
  const updateProject = useMutation(api.portfolio.mutations.updateProject);
  const removeProject = useMutation(api.portfolio.mutations.removeProject);
  const uploadFile = useUploadFile(api.r2);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Id<"projects"> | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFileEntry[]>([]);
  const slugManuallyEdited = useRef(false);

  const isLoading = projects === undefined;

  useEffect(() => {
    if (dialogOpen) {
      setPendingFiles([]);
    }
  }, [dialogOpen]);

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
    defaultValues: defaultFormValues(),
    validators: { onSubmit: projectSchema as any },
    onSubmit: async ({ value }) => {
      try {
        const uploadedImages = await uploadPendingFiles();
        const allImages = [...value.images, ...uploadedImages];

        const payload = {
          title: value.title,
          slug: value.slug,
          description: normalizeOptionalText(value.description ?? ""),
          philosophy: normalizeOptionalText(value.philosophy ?? ""),
          keyKnowledge: value.keyKnowledge.length > 0 ? value.keyKnowledge : undefined,
          keyFeatures: value.keyFeatures.length > 0 ? value.keyFeatures : undefined,
          url: normalizeOptionalText(value.url ?? ""),
          githubUrl: normalizeOptionalText(value.githubUrl ?? ""),
          technologies: value.technologies.length > 0 ? value.technologies : undefined,
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

        setDialogOpen(false);
        setEditingProject(undefined);
        setPendingFiles([]);
        form.reset();
        slugManuallyEdited.current = false;
      } catch (error) {
        handleError(error, { context: "ProjectsList.handleSubmit" });
      }
    },
  });

  const openCreate = () => {
    setEditingProject(undefined);
    slugManuallyEdited.current = false;
    form.reset();
    setDialogOpen(true);
  };

  const openEdit = (project: AdminProject) => {
    setEditingProject(project);
    slugManuallyEdited.current = true;
    form.reset();
    form.setFieldValue("title", project.title);
    form.setFieldValue("slug", project.slug);
    form.setFieldValue("description", project.description ?? "");
    form.setFieldValue("philosophy", project.philosophy ?? "");
    form.setFieldValue("keyKnowledge", project.keyKnowledge ?? []);
    form.setFieldValue("keyFeatures", project.keyFeatures ?? []);
    form.setFieldValue("url", project.url ?? "");
    form.setFieldValue("githubUrl", project.githubUrl ?? "");
    form.setFieldValue("technologies", project.technologies ?? []);
    form.setFieldValue("images", project.images ?? []);
    form.setFieldValue("order", project.order);
    form.setFieldValue("isVisible", project.isVisible ?? true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeProject({ _id: deleteTarget });
      toast.success("Project deleted");
      setDeleteTarget(null);
    } catch (error) {
      handleError(error, { context: "ProjectsList.handleDelete" });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Loading projects...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {!projects || projects.length === 0 ? (
            <div className="py-10 text-center">
              <FolderKanbanIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No projects yet</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{project.title}</h4>
                    {project.isVisible ? (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        Visible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    /{project.slug}
                  </p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(project)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setDeleteTarget(project._id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Sheet open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingProject(undefined); slugManuallyEdited.current = false; } }}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
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
                      <div className="grid gap-3">
                        <Label>Title</Label>
                        <Input
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
                        {field.state.meta.errors.map((err) => (
                          <p key={err?.message} className="text-xs text-destructive">{err?.message}</p>
                        ))}
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="slug">
                    {(field) => (
                      <div className="grid gap-3">
                        <div className="flex items-center gap-2">
                          <Label>Slug</Label>
                          {!slugManuallyEdited.current && !editingProject && field.state.value && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground">
                              <SparklesIcon className="h-2.5 w-2.5 mr-0.5" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <Input
                          value={field.state.value}
                          onChange={(e) => {
                            slugManuallyEdited.current = true;
                            field.handleChange(e.target.value);
                          }}
                          placeholder="project-slug"
                          required
                        />
                        {field.state.meta.errors.map((err) => (
                          <p key={err?.message} className="text-xs text-destructive">{err?.message}</p>
                        ))}
                      </div>
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

                <form.Field name="technologies">
                  {(field) => (
                    <div className="grid gap-3">
                      <div className="flex items-center gap-1.5">
                        <PuzzleIcon className="h-4 w-4 text-muted-foreground" />
                        <Label>Technologies</Label>
                      </div>
                      <TagsInput
                        value={field.state.value}
                        onChange={field.handleChange}
                        placeholder="e.g. React, Rust, PostgreSQL"
                      />
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
                      projectId={editingProject?._id}
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
                      onClick={() => {
                        setDialogOpen(false);
                        setEditingProject(undefined);
                        slugManuallyEdited.current = false;
                      }}
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
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
