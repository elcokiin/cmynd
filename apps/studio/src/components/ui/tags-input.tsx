import { useState, type KeyboardEvent } from "react";
import { XIcon } from "lucide-react";
import { Input } from "@elcokiin/ui/input";
import { Badge } from "@elcokiin/ui/badge";
import { cn } from "@elcokiin/ui/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagsInput({ value, onChange, placeholder, className }: TagsInputProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      e.preventDefault();
      const lastTag = value[value.length - 1]!;
      onChange(value.slice(0, -1));
      setInput(lastTag);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 p-2 rounded-none border border-input bg-background focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-destructive"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="border-0 p-0 h-6 min-w-[120px] flex-1 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
