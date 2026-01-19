import { Button } from "@elcokiin/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

export function CreateDocumentButton(): React.ReactNode {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate({ to: "/editor/new" });
  };

  return (
    <Button onClick={handleCreate}>
      <PlusIcon className="h-4 w-4 mr-2" />
      New Document
    </Button>
  );
}
