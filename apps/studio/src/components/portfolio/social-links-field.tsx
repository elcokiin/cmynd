import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import type { SocialLink } from "@elcokiin/backend/lib/types/portfolio";

interface SocialLinksFieldProps {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export function SocialLinksField({ value, onChange }: SocialLinksFieldProps) {
  const addLink = () => {
    onChange([...value, { platform: "", url: "", label: "" }]);
  };

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof SocialLink, val: string) => {
    const updated = value.map((link, i) =>
      i === index ? { ...link, [field]: val || undefined } : link,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>Social Links</Label>
      {value.map((link, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-3 gap-2">
            <Input
              placeholder="Platform"
              value={link.platform}
              onChange={(e) => updateLink(index, "platform", e.target.value)}
            />
            <Input
              placeholder="URL"
              value={link.url}
              onChange={(e) => updateLink(index, "url", e.target.value)}
            />
            <Input
              placeholder="Label (optional)"
              value={link.label ?? ""}
              onChange={(e) => updateLink(index, "label", e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeLink(index)}
            className="shrink-0 mt-0.5"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addLink}>
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Link
      </Button>
    </div>
  );
}
