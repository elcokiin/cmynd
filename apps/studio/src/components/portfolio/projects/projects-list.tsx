import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Badge } from "@elcokiin/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@elcokiin/ui/card";
import {
  Sheet,
  SheetContent,
} from "@elcokiin/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@elcokiin/ui/dialog";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ProjectFormSheet } from "@/components/portfolio/projects/project-form-sheet";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  FolderKanbanIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { AdminProject } from "@elcokiin/backend/lib/types/portfolio";

interface ProjectsListProps {
  projects: AdminProject[] | undefined;
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const { handleError } = useErrorHandler();
  const removeProject = useMutation(api.portfolio.mutations.removeProject);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Id<"projects"> | null>(null);

  const isLoading = projects === undefined;

  const openCreate = () => {
    setEditingProject(undefined);
    setDialogOpen(true);
  };

  const openEdit = (project: AdminProject) => {
    setEditingProject(project);
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

  const handleSheetChange = (open: boolean) => {
    if (!open) {
      setDialogOpen(false);
      setEditingProject(undefined);
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
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.skills.map((skill) => (
                        <Badge key={skill._id} variant="outline" className="text-xs">
                          {skill.name}
                          {skill.role ? ` · ${skill.role}` : ""}
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

      <Sheet open={dialogOpen} onOpenChange={handleSheetChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <ProjectFormSheet
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            editingProject={editingProject}
          />
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
