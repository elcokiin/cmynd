import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { EmojiPicker } from "@elcokiin/ui/emoji-picker";
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
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No hobbies added yet. Click below to add one.</p>
      ) : (
        value.map((hobby, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Name"
                  value={hobby.name}
                  onChange={(e) => updateHobby(index, "name", e.target.value)}
                  className="h-9"
                />
                <EmojiPicker
                  value={hobby.emoji ?? ""}
                  onChange={(val) => updateHobby(index, "emoji", val)}
                  placeholder="Pick emoji"
                />
              </div>
              <Input
                placeholder="Description (optional)"
                value={hobby.description ?? ""}
                onChange={(e) => updateHobby(index, "description", e.target.value)}
                className="h-9"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeHobby(index)}
              className="shrink-0 size-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
      <Button type="button" variant="outline" size="sm" onClick={addHobby}>
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Hobby
      </Button>
    </div>
  );
}
