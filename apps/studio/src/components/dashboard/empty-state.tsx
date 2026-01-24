import { FileTextIcon } from "lucide-react";

import { CreateDocumentButton } from "./create-document-button";

export function EmptyState(): React.ReactNode {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileTextIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No documents yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first document to get started. You can write original
        content, curate from other sources, or collect inspiration.
      </p>
      <CreateDocumentButton />
    </div>
  );
}
