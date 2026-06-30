import { ImageIcon } from "lucide-react";

import { useToolbarContext } from "src/components/editor/context/toolbar-context";
import { InsertImageDialog } from "src/components/editor/extensions/images-extension";
import { DropdownMenuItem } from "src/components/dropdown-menu";

export function InsertImage() {
  const { activeEditor, showModal } = useToolbarContext();

  return (
    <DropdownMenuItem
      onClick={() => {
        showModal("Insert Image", (onClose) => (
          <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
        ));
      }}
    >
      <div className="flex items-center gap-1">
        <ImageIcon className="size-4" />
        <span>Image</span>
      </div>
    </DropdownMenuItem>
  );
}
