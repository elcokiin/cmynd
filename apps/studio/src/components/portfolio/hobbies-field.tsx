import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import type { Hobby } from "@elcokiin/backend/lib/types/portfolio";

interface HobbiesFieldProps {
  value: Hobby[];
  onChange: (hobbies: Hobby[]) => void;
}

export function HobbiesField({ value, onChange }: HobbiesFieldProps) {
  const addHobby = () => {
    onChange([...value, { name: "", description: "", emoji: "" }]);
  };

  const removeHobby = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateHobby = (index: number, field: keyof Hobby, val: string) => {
    const updated = value.map((hobby, i) =>
      i === index ? { ...hobby, [field]: val || undefined } : hobby,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>Hobbies</Label>
      {value.map((hobby, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <Input
              placeholder="Name"
              value={hobby.name}
              onChange={(e) => updateHobby(index, "name", e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={hobby.description ?? ""}
              onChange={(e) => updateHobby(index, "description", e.target.value)}
            />
            <Input
              placeholder="Emoji (optional)"
              value={hobby.emoji ?? ""}
              onChange={(e) => updateHobby(index, "emoji", e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeHobby(index)}
            className="shrink-0 mt-0.5"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addHobby}>
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Hobby
      </Button>
    </div>
  );
}
