import { PlusIcon, Trash2Icon, LinkIcon } from "lucide-react";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
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
      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No social links added yet. Click below to add one.</p>
      ) : (
        value.map((link, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted mt-0.5">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Platform"
                  value={link.platform}
                  onChange={(e) => updateLink(index, "platform", e.target.value)}
                  className="h-9"
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink(index, "url", e.target.value)}
                  className="h-9"
                />
              </div>
              <Input
                placeholder="Label (optional)"
                value={link.label ?? ""}
                onChange={(e) => updateLink(index, "label", e.target.value)}
                className="h-9"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLink(index)}
              className="shrink-0 size-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
      <Button type="button" variant="outline" size="sm" onClick={addLink}>
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Link
      </Button>
    </div>
  );
}
