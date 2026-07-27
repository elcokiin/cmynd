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
import { ExperienceFormSheet } from "@/components/portfolio/experience/experience-form-sheet";
import { PlusIcon, PencilIcon, Trash2Icon, BriefcaseIcon } from "lucide-react";
import { toast } from "sonner";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { AdminExperience, ExperienceType } from "@elcokiin/backend/lib/types/portfolio";

interface ExperienceListProps {
  experience: AdminExperience[] | undefined;
}

const typeLabels: Record<ExperienceType, string> = {
  work: "Work",
  education: "Education",
  certification: "Certification",
};

const typeColors: Record<ExperienceType, string> = {
  work: "bg-blue-100 text-blue-800",
  education: "bg-purple-100 text-purple-800",
  certification: "bg-green-100 text-green-800",
};

export function ExperienceList({ experience }: ExperienceListProps) {
  const { handleError } = useErrorHandler();
  const removeExperience = useMutation(api.portfolio.mutations.removeExperience);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AdminExperience | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Id<"experience"> | null>(null);

  const isLoading = experience === undefined;

  const openCreate = () => {
    setEditingEntry(undefined);
    setDialogOpen(true);
  };

  const openEdit = (entry: AdminExperience) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleSheetChange = (open: boolean) => {
    if (!open) {
      setDialogOpen(false);
      setEditingEntry(undefined);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeExperience({ _id: deleteTarget });
      toast.success("Experience deleted");
      setDeleteTarget(null);
    } catch (error) {
      handleError(error, { context: "ExperienceList.handleDelete" });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Loading experience...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Experience</CardTitle>
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {!experience || experience.length === 0 ? (
            <div className="py-10 text-center">
              <BriefcaseIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No experience entries yet</p>
            </div>
          ) : (
            experience.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={typeColors[entry.type]}>
                      {typeLabels[entry.type]}
                    </Badge>
                    <h4 className="font-medium">{entry.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      at {entry.organization}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.startDate && (
                      <span className="text-xs text-muted-foreground">
                        {entry.startDate}
                        {entry.isCurrent
                          ? " - Present"
                          : entry.endDate
                            ? ` - ${entry.endDate}`
                            : ""}
                      </span>
                    )}
                    {entry.isCurrent && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        Current
                      </Badge>
                    )}
                  </div>
                  {entry.technologies && entry.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.technologies.map((tech) => (
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
                    onClick={() => openEdit(entry)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setDeleteTarget(entry._id)}
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
          <ExperienceFormSheet
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            editingEntry={editingEntry}
          />
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Experience</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this experience entry? This action cannot be undone.
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
