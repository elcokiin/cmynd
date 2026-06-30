import { PlusIcon } from "lucide-react";

import { useEditorModal } from "src/components/editor/editor-hooks/use-modal";
import { Button } from "src/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "src/components/dropdown-menu";

export function BlockInsertPlugin({ children }: { children: React.ReactNode }) {
  const [modal] = useEditorModal();

  return (
    <>
      {modal}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1 px-2" />}><PlusIcon className="size-4" /><span className="text-sm">Insert</span></DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit">{children}</DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
