import { Columns3Icon } from "lucide-react";

import { useToolbarContext } from "src/components/editor/context/toolbar-context";
import { InsertLayoutDialog } from "src/components/editor/plugins/layout-plugin";
import { DropdownMenuItem } from "src/components/dropdown-menu";

export function InsertColumnsLayout() {
  const { activeEditor, showModal } = useToolbarContext();

  return (
    <DropdownMenuItem
      onClick={() =>
        showModal("Insert Columns Layout", (onClose) => (
          <InsertLayoutDialog activeEditor={activeEditor} onClose={onClose} />
        ))
      }
    >
      <div className="flex items-center gap-1">
        <Columns3Icon className="size-4" />
        <span>Columns Layout</span>
      </div>
    </DropdownMenuItem>
  );
}
