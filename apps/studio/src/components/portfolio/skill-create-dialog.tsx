import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@elcokiin/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@elcokiin/ui/dialog";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { WrenchIcon } from "lucide-react";
import { toast } from "sonner";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { SkillLevel } from "@elcokiin/backend/lib/types/portfolio";

interface SkillCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (skillId: Id<"skills">) => void;
}

const levelOptions: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export function SkillCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: SkillCreateDialogProps) {
  const { handleError } = useErrorHandler();
  const upsertSkill = useMutation(api.portfolio.mutations.upsertSkill);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState<SkillLevel>("intermediate");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setCategory("");
    setLevel("intermediate");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const skillId = await upsertSkill({
        name: name.trim(),
        category: category.trim(),
        level,
      });
      toast.success("Skill created");
      reset();
      onOpenChange(false);
      onCreated?.(skillId);
    } catch (error) {
      handleError(error, { context: "SkillCreateDialog.handleSubmit" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <WrenchIcon className="h-4 w-4 text-muted-foreground" />
              <DialogTitle>New Skill</DialogTitle>
            </div>
            <DialogDescription>
              Create a skill and it will be added to the list.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="skill-name">Name</Label>
              <Input
                id="skill-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. TypeScript"
                autoFocus
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="skill-category">Category</Label>
              <Input
                id="skill-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Languages"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="skill-level">Level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as SkillLevel)}>
                <SelectTrigger id="skill-level">
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Skill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
