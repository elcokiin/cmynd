import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Switch } from "@elcokiin/ui/switch";
import { Label } from "@elcokiin/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@elcokiin/ui/select";
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
import { PlusIcon, Trash2Icon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type {
  AdminSkill,
  SkillLevel,
} from "@elcokiin/backend/lib/types/portfolio";

interface SkillsManagerProps {
  skills: AdminSkill[] | undefined;
}

const levelOptions: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

interface SkillRow {
  _id?: Id<"skills">;
  name: string;
  category: string;
  level: SkillLevel;
  isVisible: boolean;
}

interface SkillRowErrors {
  name?: string;
  category?: string;
}

function validateRow(row: SkillRow): SkillRowErrors {
  return {
    name: row.name.trim() ? undefined : "Name is required",
    category: row.category.trim() ? undefined : "Category is required",
  };
}

export function SkillsManager({ skills }: SkillsManagerProps) {
  const { handleError } = useErrorHandler();
  const upsertSkill = useMutation(api.portfolio.mutations.upsertSkill);
  const removeSkill = useMutation(api.portfolio.mutations.removeSkill);

  const [rows, setRows] = useState<SkillRow[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, SkillRowErrors>>({});
  const [deleteTarget, setDeleteTarget] = useState<Id<"skills"> | null>(null);

  const isLoading = skills === undefined;

  useEffect(() => {
    if (skills) {
      setRows(
        skills.map((s) => ({
          _id: s._id,
          name: s.name,
          category: s.category,
          level: s.level ?? "intermediate",
          isVisible: s.isVisible ?? true,
        })),
      );
      setRowErrors({});
    }
  }, [skills]);

  const updateRow = (index: number, field: keyof SkillRow, value: unknown) => {
    setRows((prev) => {
      const updated = prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      );
      if (field === "name" || field === "category") {
        setRowErrors((errs) => ({
          ...errs,
          [index]: validateRow(updated[index]),
        }));
      }
      return updated;
    });
  };

  const handleSave = async (index: number) => {
    const row = rows[index];
    if (!row) return;
    const errors = validateRow(row);
    if (errors.name || errors.category) {
      setRowErrors((prev) => ({ ...prev, [index]: errors }));
      return;
    }
    try {
      await upsertSkill({
        _id: row._id,
        name: row.name,
        category: row.category,
        level: row.level,
        isVisible: row.isVisible,
      });
      toast.success(row._id ? "Skill updated" : "Skill created");
    } catch (error) {
      handleError(error, { context: "SkillsManager.handleSave" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeSkill({ _id: deleteTarget });
      toast.success("Skill deleted");
      setDeleteTarget(null);
    } catch (error) {
      handleError(error, { context: "SkillsManager.handleDelete" });
    }
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { name: "", category: "", level: "intermediate", isVisible: true },
    ]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Loading skills...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Skills</CardTitle>
            <Button size="sm" onClick={addRow}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {rows.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex size-14 items-center justify-center rounded-full bg-muted mb-3">
                <WrenchIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No skills yet</p>
              <p className="text-xs text-muted-foreground mb-4">Add your first skill to get started</p>
              <Button size="sm" onClick={addRow}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Skill
              </Button>
            </div>
          ) : (
            rows.map((row, index) => {
              const errors = rowErrors[index];
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={row.name}
                      onChange={(e) => updateRow(index, "name", e.target.value)}
                      onBlur={() => handleSave(index)}
                      placeholder="Skill name"
                      aria-invalid={!!errors?.name || undefined}
                    />
                    {errors?.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={row.category}
                      onChange={(e) => updateRow(index, "category", e.target.value)}
                      onBlur={() => handleSave(index)}
                      placeholder="Category"
                      aria-invalid={!!errors?.category || undefined}
                    />
                    {errors?.category && (
                      <p className="text-xs text-destructive">{errors.category}</p>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">Level</Label>
                    <Select
                      value={row.level}
                      onValueChange={(value) => {
                        updateRow(index, "level", value as SkillLevel);
                        handleSave(index);
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-1 sm:pt-0">
                    <Switch
                      checked={row.isVisible}
                      onCheckedChange={(checked) => {
                        updateRow(index, "isVisible", checked);
                        handleSave(index);
                      }}
                    />
                    <Label className="text-xs font-medium">Visible</Label>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => row._id && setDeleteTarget(row._id)}
                  className="shrink-0 text-destructive self-end sm:self-center"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Skill</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this skill? This action cannot be undone.
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
