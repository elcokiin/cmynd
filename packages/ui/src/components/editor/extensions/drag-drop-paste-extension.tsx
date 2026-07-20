import { DRAG_DROP_PASTE } from "@lexical/rich-text";
import { isMimeType, mediaFileReader } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW, defineExtension } from "lexical";

import type { UploadFn } from "src/components/editor";
import { INSERT_IMAGE_COMMAND } from "src/components/editor/extensions/images-extension";

const ACCEPTABLE_IMAGE_TYPES = [
  "image/",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/webp",
];

export const DragDropPasteExtension = defineExtension({
  name: "@shadcn-editor/DragDropPaste",
  register: (
    editor,
    config?: { uploadFn?: UploadFn },
  ) =>
    editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        (async () => {
          const filesResult = await mediaFileReader(
            files,
            [ACCEPTABLE_IMAGE_TYPES].flatMap((x) => x),
          );
          for (const { file, result } of filesResult) {
            if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
              if (config?.uploadFn) {
                try {
                  const { url, storageId } = await config.uploadFn(file);
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    altText: file.name,
                    src: url,
                    storageId,
                  });
                } catch (error) {
                  console.error("[DragDropPaste] Image upload failed:", error);
                }
              } else {
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                  altText: file.name,
                  src: result,
                });
              }
            }
          }
        })();
        return true;
      },
      COMMAND_PRIORITY_LOW,
    ),
});
