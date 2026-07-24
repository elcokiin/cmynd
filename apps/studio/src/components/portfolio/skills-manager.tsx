import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Switch } from "@elcokiin/ui/switch";
import { Label } from "@elcokiin/ui/label";
import { Slider } from "@elcokiin/ui/slider";
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
import type { AdminSkill } from "@elcokiin/backend/lib/types/portfolio";

interface SkillsManagerProps {
  skills: AdminSkill[] | undefined;
}

interface SkillRow {
  _id?: Id<"skills">;
  name: string;
  category: string;
  proficiency: number;
  isVisible: boolean;
}

export function SkillsManager({ skills }: SkillsManagerProps) {
  const { handleError } = useErrorHandler();
  const upsertSkill = useMutation(api.portfolio.mutations.upsertSkill);
  const removeSkill = useMutation(api.portfolio.mutations.removeSkill);

  const [rows, setRows] = useState<SkillRow[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Id<"skills"> | null>(null);

  const isLoading = skills === undefined;

  useEffect(() => {
    if (skills) {
      setRows(
        skills.map((s) => ({
          _id: s._id,
          name: s.name,
          category: s.category,
          proficiency: s.proficiency ?? 0,
          isVisible: s.isVisible ?? true,
        })),
      );
    }
  }, [skills]);

  const updateRow = (index: number, field: keyof SkillRow, value: unknown) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const handleSave = async (index: number) => {
    const row = rows[index];
    if (!row) return;
    try {
      await upsertSkill({
        _id: row._id,
        name: row.name,
        category: row.category,
        proficiency: row.proficiency,
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
      { name: "", category: "", proficiency: 50, isVisible: true },
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
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <div className="py-10 text-center">
              <WrenchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No skills yet</p>
            </div>
          ) : (
            rows.map((row, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1 grid grid-cols-4 gap-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={row.name}
                      onChange={(e) => updateRow(index, "name", e.target.value)}
                      onBlur={() => handleSave(index)}
                      placeholder="Skill name"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Category</Label>
                    <Input
                      value={row.category}
                      onChange={(e) => updateRow(index, "category", e.target.value)}
                      onBlur={() => handleSave(index)}
                      placeholder="Category"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">
                      Proficiency: {row.proficiency}
                    </Label>
                    <Slider
                      value={[row.proficiency]}
                      onValueChange={([v]) => updateRow(index, "proficiency", v ?? 0)}
                      onValueCommit={() => handleSave(index)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={row.isVisible}
                      onCheckedChange={(checked) => {
                        updateRow(index, "isVisible", checked);
                        handleSave(index);
                      }}
                    />
                    <Label className="text-xs">Visible</Label>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => row._id && setDeleteTarget(row._id)}
                  className="shrink-0 text-destructive"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            ))
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
