import { type JSX, useCallback, useEffect, useRef, useState } from "react";

import {
  $isAutoLinkNode,
  $isLinkNode,
  type LinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $createRangeSelection,
  $findMatchingParent,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  type LexicalCommand,
  type LexicalEditor,
  createCommand,
  defineExtension,
  getDOMSelectionFromTarget,
  isHTMLElement,
} from "lexical";

import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  type ImagePayload,
} from "src/components/editor/nodes/image-node";
import { Button } from "src/components/button";
import { DialogFooter } from "src/components/dialog";
import { Field, FieldLabel } from "src/components/field";
import { Input } from "src/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/tabs";
import { useEditorConfig } from "src/components/editor/context/editor-config-context";

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

export function InsertImageUriDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");

  return (
    <div className="flex flex-col gap-3 py-3">
      <Field>
        <FieldLabel htmlFor="image-uri-src">Image URL</FieldLabel>
        <Input
          id="image-uri-src"
          placeholder="https://source.unsplash.com/random"
          onChange={(e) => setSrc(e.target.value)}
          value={src}
          data-test-id="image-modal-url-input"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="image-uri-alt">Alt Text</FieldLabel>
        <Input
          id="image-uri-alt"
          placeholder="Descriptive alternative text"
          onChange={(e) => setAltText(e.target.value)}
          value={altText}
          data-test-id="image-modal-alt-text-input"
        />
      </Field>
      <DialogFooter>
        <Button
          disabled={src === ""}
          onClick={() => onClick({ altText, src })}
          data-test-id="image-modal-confirm-btn"
        >
          Confirm
        </Button>
      </DialogFooter>
    </div>
  );
}

export function InsertImageUploadedDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");

  const loadImage = (files: FileList | null) => {
    const reader = new FileReader();
    reader.onload = function () {
      if (typeof reader.result === "string") {
        setSrc(reader.result);
      }
    };
    const file = files?.[0];
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-3 py-3">
      <Field>
        <FieldLabel htmlFor="image-upload-file">Image</FieldLabel>
        <Input
          id="image-upload-file"
          type="file"
          onChange={(e) => loadImage(e.target.files)}
          accept="image/*"
          data-test-id="image-modal-file-upload"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="image-upload-alt">Alt Text</FieldLabel>
        <Input
          id="image-upload-alt"
          placeholder="Descriptive alternative text"
          onChange={(e) => setAltText(e.target.value)}
          value={altText}
          data-test-id="image-modal-alt-text-input"
        />
      </Field>
      <DialogFooter>
        <Button
          disabled={src === ""}
          onClick={() => onClick({ altText, src })}
          data-test-id="image-modal-file-upload-btn"
        >
          Confirm
        </Button>
      </DialogFooter>
    </div>
  );
}

export function InsertImageDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const { uploadFn } = useEditorConfig();
  const [urlOrPreview, setUrlOrPreview] = useState("");
  const [altText, setAltText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tab, setTab] = useState("url");
  const [fileInputKey, setFileInputKey] = useState(0);

  const hasModifier = useRef(false);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor]);

  const isUrlTab = tab === "url";
  const isDisabled = isUrlTab
    ? urlOrPreview === ""
    : !selectedFile || isUploading;

  const resetFileState = useCallback(() => {
    setSelectedFile(null);
    setUrlOrPreview("");
    setUploadError(null);
    setFileInputKey((k) => k + 1);
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) {
      resetFileState();
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = function () {
      if (typeof reader.result === "string") {
        setUrlOrPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [resetFileState]);

  const handleConfirm = useCallback(async () => {
    if (isUrlTab) {
      activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, { altText, src: urlOrPreview });
      onClose();
      return;
    }

    if (!selectedFile || !uploadFn) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const { url, storageId } = await uploadFn(selectedFile);
      activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        altText,
        src: url,
        storageId,
      });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed. Try again.";
      setUploadError(message);
      setIsUploading(false);
    }
  }, [isUrlTab, activeEditor, altText, urlOrPreview, selectedFile, uploadFn, onClose]);

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="url" value={tab} onValueChange={(v) => { setTab(v); resetFileState(); }}>
        <TabsList className="w-full">
          <TabsTrigger value="url" className="flex-1">URL</TabsTrigger>
          <TabsTrigger value="file" className="flex-1">File</TabsTrigger>
        </TabsList>
        <TabsContent value="url">
          <Field>
            <FieldLabel htmlFor="image-dialog-url">Image URL</FieldLabel>
            <Input
              id="image-dialog-url"
              placeholder="https://source.unsplash.com/random"
              onChange={(e) => setUrlOrPreview(e.target.value)}
              value={urlOrPreview}
              data-test-id="image-modal-url-input"
            />
          </Field>
        </TabsContent>
        <TabsContent value="file">
          <Field>
            <FieldLabel htmlFor="image-dialog-file">Image</FieldLabel>
            <Input
              key={fileInputKey}
              id="image-dialog-file"
              type="file"
              onChange={(e) => handleFileSelect(e.target.files)}
              accept="image/*"
              data-test-id="image-modal-file-upload"
            />
          </Field>
          {uploadError && (
            <p className="text-sm text-destructive mt-1">{uploadError}</p>
          )}
        </TabsContent>
      </Tabs>
      <Field>
        <FieldLabel htmlFor="image-dialog-alt">Alt Text</FieldLabel>
        <Input
          id="image-dialog-alt"
          placeholder="Descriptive alternative text"
          onChange={(e) => setAltText(e.target.value)}
          value={altText}
          data-test-id="image-modal-alt-text-input"
        />
      </Field>
      <DialogFooter>
        <Button
          disabled={isDisabled}
          onClick={handleConfirm}
          data-test-id="image-modal-confirm-btn"
        >
          {isUploading ? "Uploading..." : "Confirm"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export const ImagesExtension = defineExtension({
  name: "@shadcn-editor/Images",
  nodes: [ImageNode],
  register: (editor) =>
    mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => $onDragStart(event),
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => $onDragover(event),
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => $onDrop(event, editor),
        COMMAND_PRIORITY_HIGH,
      ),
    ),
});

const TRANSPARENT_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const img = document.createElement("img");
img.src = TRANSPARENT_IMAGE;

function $onDragStart(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData("text/plain", "_");
  dataTransfer.setDragImage(img, 0, 0);
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        src: node.__src,
        width: node.__width,
      },
      type: "image",
    }),
  );

  return true;
}

function $onDragover(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return false;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  const existingLink = $findMatchingParent(
    node,
    (parent): parent is LinkNode =>
      !$isAutoLinkNode(parent) && $isLinkNode(parent),
  );
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
    if (existingLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, existingLink.getURL());
    }
  }
  return true;
}

function $getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag");
  if (!dragData) {
    return null;
  }
  const { type, data } = JSON.parse(dragData);
  if (type !== "image") {
    return null;
  }

  return data;
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    isHTMLElement(target) &&
    !target.closest("code, span.editor-image") &&
    isHTMLElement(target.parentElement) &&
    target.parentElement.closest("div.ContentEditable__root")
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const domSelection = getDOMSelectionFromTarget(event.target);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }

  return range;
}
