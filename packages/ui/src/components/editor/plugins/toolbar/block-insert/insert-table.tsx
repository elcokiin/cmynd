import { TableIcon } from "lucide-react";

import { useToolbarContext } from "src/components/editor/context/toolbar-context";
import { InsertTableDialog } from "src/components/editor/plugins/table-plugin";
import { DropdownMenuItem } from "src/components/dropdown-menu";

export function InsertTable() {
  const { activeEditor, showModal } = useToolbarContext();

  return (
    <DropdownMenuItem
      onClick={() =>
        showModal("Insert Table", (onClose) => (
          <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
        ))
      }
    >
      <div className="flex items-center gap-1">
        <TableIcon className="size-4" />
        <span>Table</span>
      </div>
    </DropdownMenuItem>
  );
}
