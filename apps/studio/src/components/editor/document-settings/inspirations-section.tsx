import { LinkIcon } from "lucide-react";

export function InspirationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Inspirations</h3>
        <p className="text-sm text-muted-foreground">
          Add links and sources that inspired you.
        </p>
      </div>
      <div className="flex items-center justify-center h-48 rounded-lg border border-dashed bg-muted/30">
        <div className="text-center">
          <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            This feature is still being built.
          </p>
        </div>
      </div>
    </div>
  );
}
