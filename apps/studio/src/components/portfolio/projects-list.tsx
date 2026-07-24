import { useState } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@elcokiin/ui/dialog";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { PlusIcon, PencilIcon, Trash2Icon, FolderKanbanIcon, FileTextIcon } from "lucide-react";
import { toast } from "sonner";
import { normalizeOptionalText } from "@/lib/text";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { AdminProject } from "@elcokiin/backend/lib/types/portfolio";

interface ProjectsListProps {
  projects: AdminProject[] | undefined;
}

const projectImageSchema = z.object({
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

export function ProjectsList({ projects }: ProjectsListProps) {
  const { handleError } = useErrorHandler();
  const createProject = useMutation(api.portfolio.mutations.createProject);
  const updateProject = useMutation(api.portfolio.mutations.updateProject);
  const removeProject = useMutation(api.portfolio.mutations.removeProject);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Id<"projects"> | null>(null);

  const isLoading = projects === undefined;

  const form = useForm({
    defaultValues: defaultFormValues(),
    validators: { onSubmit: projectSchema as any },
    onSubmit: async ({ value }) => {
      try {
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
          images: value.images.length > 0 ? value.images : undefined,
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
        form.reset();
      } catch (error) {
        handleError(error, { context: "ProjectsList.handleSubmit" });
      }
    },
  });

  const openCreate = () => {
    setEditingProject(undefined);
    form.reset();
    setDialogOpen(true);
  };

  const openEdit = (project: AdminProject) => {
    setEditingProject(project);
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
        <CardContent className="space-y-3">
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

      <Dialog open={dialogOpen} onOpenChange={(open) => { !open && setDialogOpen(false); }}>
        <DialogContent className="sm:max-w-[600px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "New Project"}
              </DialogTitle>
              <DialogDescription>
                Fill in the project details below.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="title">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
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
                    <div className="grid gap-2">
                      <Label>Slug</Label>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
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
                  <div className="grid gap-2">
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

              <form.Field name="philosophy">
                {(field) => (
                  <div className="grid gap-2">
                    <Label>Philosophy</Label>
                    <TextareaWithIcon
                      icon={<FileTextIcon />}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Project philosophy"
                      rows={3}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="keyKnowledge">
                {(field) => (
                  <div className="grid gap-2">
                    <Label>Key Knowledge</Label>
                    <TagsInput
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Type and press Enter to add..."
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="keyFeatures">
                {(field) => (
                  <div className="grid gap-2">
                    <Label>Key Features</Label>
                    <TagsInput
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Type and press Enter to add..."
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="url">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label>URL</Label>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="https://..."
                        type="url"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="githubUrl">
                  {(field) => (
                    <div className="grid gap-2">
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

              <form.Field name="technologies">
                {(field) => (
                  <div className="grid gap-2">
                    <Label>Technologies</Label>
                    <TagsInput
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Type and press Enter to add..."
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="images">
                {(field) => (
                  <div className="grid gap-2">
                    <Label>Images</Label>
                    <div className="space-y-2">
                      {field.state.value.map((img, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            placeholder="Image URL"
                            value={img.url}
                            onChange={(e) => {
                              const updated = [...field.state.value];
                              updated[i] = { ...updated[i]!, url: e.target.value };
                              field.handleChange(updated);
                            }}
                          />
                          <Input
                            placeholder="Alt text (optional)"
                            value={img.alt ?? ""}
                            onChange={(e) => {
                              const updated = [...field.state.value];
                              updated[i] = { ...updated[i]!, alt: e.target.value || undefined };
                              field.handleChange(updated);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updated = field.state.value.filter((_, idx) => idx !== i);
                              field.handleChange(updated);
                            }}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          field.handleChange([...field.state.value, { url: "", alt: "" }])
                        }
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Image
                      </Button>
                    </div>
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="order">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label>Order</Label>
                      <Input
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="isVisible">
                  {(field) => (
                    <div className="flex items-center gap-2 pt-6">
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

            <DialogFooter>
              <form.Subscribe>
                {(state) => (
                  <>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setDialogOpen(false);
                        setEditingProject(undefined);
                      }}
                      disabled={state.isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={state.isSubmitting}>
                      {state.isSubmitting
                        ? "Saving..."
                        : editingProject
                          ? "Update Project"
                          : "Create Project"}
                    </Button>
                  </>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
