import { useMemo } from "react";
import { cn } from "@elcokiin/ui/lib/utils";
import { Badge } from "@elcokiin/ui/badge";
import { Button } from "@elcokiin/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@elcokiin/ui/select";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { AdminSkill } from "@elcokiin/backend/lib/types/portfolio";

export interface SkillLinkValue {
  skillId: Id<"skills">;
  role?: "core" | "secondary";
}

interface SkillPickerProps {
  skills: AdminSkill[] | undefined;
  value: SkillLinkValue[];
  onChange: (value: SkillLinkValue[]) => void;
  withRole?: boolean;
}

const roleLabels: Record<NonNullable<SkillLinkValue["role"]>, string> = {
  core: "Core",
  secondary: "Secondary",
};

export function SkillPicker({
  skills,
  value,
  onChange,
  withRole = false,
}: SkillPickerProps) {
  const selectedIds = useMemo(
    () => new Set(value.map((link) => link.skillId)),
    [value],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, AdminSkill[]>();
    for (const skill of skills ?? []) {
      const list = groups.get(skill.category) ?? [];
      list.push(skill);
      groups.set(skill.category, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [skills]);

  const toggleSkill = (skillId: Id<"skills">) => {
    if (selectedIds.has(skillId)) {
      onChange(value.filter((link) => link.skillId !== skillId));
    } else {
      onChange([...value, { skillId, role: withRole ? "core" : undefined }]);
    }
  };

  const setRole = (skillId: Id<"skills">, role: "core" | "secondary") => {
    onChange(
      value.map((link) => (link.skillId === skillId ? { ...link, role } : link)),
    );
  };

  if (!skills) {
    return (
      <p className="text-sm text-muted-foreground">Loading skills...</p>
    );
  }

  if (skills.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No skills yet. Add skills first in the Skills section.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([category, catSkills]) => (
        <div key={category}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {category}
          </p>
          <div className="flex flex-wrap gap-2">
            {catSkills.map((skill) => {
              const selected = selectedIds.has(skill._id);
              const link = value.find((l) => l.skillId === skill._id);
              return (
                <div key={skill._id} className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    onClick={() => toggleSkill(skill._id)}
                    className={cn("h-7 px-3", !selected && "text-muted-foreground")}
                  >
                    {skill.icon ? `${skill.icon} ` : ""}
                    {skill.name}
                  </Button>
                  {selected && withRole && (
                    <Select
                      value={link?.role ?? "core"}
                      onValueChange={(role) =>
                        setRole(skill._id, role as "core" | "secondary")
                      }
                    >
                      <SelectTrigger className="h-7 w-[110px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="core">
                          {roleLabels.core}
                        </SelectItem>
                        <SelectItem value="secondary">
                          {roleLabels.secondary}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {selected && !withRole && (
                    <Badge variant="secondary" className="text-[10px]">
                      added
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
