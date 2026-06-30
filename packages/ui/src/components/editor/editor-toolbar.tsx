import { ToolbarPlugin } from "src/components/editor/plugins/toolbar/toolbar-plugin";
import { HistoryToolbarPlugin } from "src/components/editor/plugins/toolbar/history-toolbar-plugin";
import { BlockFormatDropDown } from "src/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatParagraph } from "src/components/editor/plugins/toolbar/block-format/format-paragraph";
import { FormatHeading } from "src/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatBulletedList } from "src/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatNumberedList } from "src/components/editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatCheckList } from "src/components/editor/plugins/toolbar/block-format/format-check-list";
import { FormatQuote } from "src/components/editor/plugins/toolbar/block-format/format-quote";
import { FormatCodeBlock } from "src/components/editor/plugins/toolbar/block-format/format-code-block";
import { FontFamilyToolbarPlugin } from "src/components/editor/plugins/toolbar/font-family-toolbar-plugin";
import { FontSizeToolbarPlugin } from "src/components/editor/plugins/toolbar/font-size-toolbar-plugin";
import { FontFormatToolbarPlugin } from "src/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { SubSuperToolbarPlugin } from "src/components/editor/plugins/toolbar/subsuper-toolbar-plugin";
import { LinkToolbarPlugin } from "src/components/editor/plugins/toolbar/link-toolbar-plugin";
import { ClearFormattingToolbarPlugin } from "src/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin";
import { FontColorToolbarPlugin } from "src/components/editor/plugins/toolbar/font-color-toolbar-plugin";
import { FontBackgroundToolbarPlugin } from "src/components/editor/plugins/toolbar/font-background-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "src/components/editor/plugins/toolbar/element-format-toolbar-plugin";
import { BlockInsertPlugin } from "src/components/editor/plugins/toolbar/block-insert-plugin";
import { InsertTable } from "src/components/editor/plugins/toolbar/block-insert/insert-table";
import { InsertImage } from "src/components/editor/plugins/toolbar/block-insert/insert-image";
import { InsertEmbeds } from "src/components/editor/plugins/toolbar/block-insert/insert-embeds";
import { InsertColumnsLayout } from "src/components/editor/plugins/toolbar/block-insert/insert-columns-layout";
import { Separator } from "src/components/separator";

export function EditorToolbar({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: (isEditMode: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
      <ToolbarPlugin>
        {() => (
          <>
            <HistoryToolbarPlugin />

            <Separator orientation="vertical" className="h-7!" />

            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatBulletedList />
              <FormatNumberedList />
              <FormatCheckList />
              <FormatQuote />
              <FormatCodeBlock />
            </BlockFormatDropDown>

            <FontFamilyToolbarPlugin />

            <FontSizeToolbarPlugin />

            <Separator orientation="vertical" className="h-7!" />

            <FontFormatToolbarPlugin />

            <Separator orientation="vertical" className="h-7!" />

            <SubSuperToolbarPlugin />

            <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />

            <Separator orientation="vertical" className="h-7!" />

            <ClearFormattingToolbarPlugin />

            <FontColorToolbarPlugin />

            <FontBackgroundToolbarPlugin />

            <Separator orientation="vertical" className="h-7!" />

            <ElementFormatToolbarPlugin showIndent={false} />

            <Separator orientation="vertical" className="h-7!" />

            <BlockInsertPlugin>
              <InsertTable />
              <InsertImage />
              <InsertEmbeds />
              <InsertColumnsLayout />
            </BlockInsertPlugin>
          </>
        )}
      </ToolbarPlugin>
    </div>
  );
}
