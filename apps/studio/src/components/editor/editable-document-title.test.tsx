import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const { updateTitleFn, toastInfo } = vi.hoisted(() => ({
  updateTitleFn: vi.fn(async () => ({ slugDeleted: undefined as string | undefined })),
  toastInfo: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useMutation: () => updateTitleFn,
}));

vi.mock("sonner", () => ({
  toast: { info: toastInfo, error: vi.fn() },
}));

vi.mock("@/hooks/use-error-handler", () => ({
  useErrorHandler: () => ({ handleError: vi.fn(), handleErrorSilent: vi.fn() }),
}));

vi.mock("@elcokiin/ui/input", () => ({
  Input: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <input {...props} data-testid="title-input" />
  ),
}));

vi.mock("@elcokiin/ui/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { EditableDocumentTitle } from "./editable-document-title";

const DOCUMENT_ID = "jd8k3f7k2mcks3" as Id<"documents">;

type Overrides = {
  documentId?: Id<"documents">;
  initialTitle?: string;
  isEditable?: boolean;
  onTitleChange?: (title: string) => void;
};

function startEdit({
  initialTitle = "Old Title",
  isEditable = true,
  onTitleChange,
  documentId = DOCUMENT_ID,
}: Overrides = {}) {
  render(
    <EditableDocumentTitle
      documentId={documentId}
      initialTitle={initialTitle}
      isEditable={isEditable}
      onTitleChange={onTitleChange}
    />,
  );
}

function editValue(input: HTMLElement, value: string) {
  fireEvent.input(input, { target: { value } });
  fireEvent.change(input, { target: { value } });
}

beforeEach(() => {
  updateTitleFn.mockClear();
  toastInfo.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("EditableDocumentTitle", () => {
  it("renders the initial title as a button when not editing", () => {
    startEdit();
    expect(screen.getByRole("button", { name: "Old Title" })).toBeInTheDocument();
    expect(screen.queryByTestId("title-input")).not.toBeInTheDocument();
  });

  it("opens an input on click when editable", async () => {
    startEdit();
    fireEvent.click(screen.getByRole("button", { name: "Old Title" }));
    expect(screen.getByTestId("title-input")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Old Title")).toBeInTheDocument();
  });

  it("does not open the editor when not editable", () => {
    startEdit({ isEditable: false });
    const button = screen.getByRole("button", { name: "Old Title" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(screen.queryByTestId("title-input")).not.toBeInTheDocument();
  });

  it("saves the trimmed title on blur when it changed", async () => {
    startEdit();
    fireEvent.click(screen.getByRole("button", { name: "Old Title" }));
    const input = screen.getByTestId("title-input") as HTMLInputElement;
    editValue(input, "  My New Title  ");
    fireEvent.blur(input);

    await vi.waitFor(() => {
      expect(updateTitleFn).toHaveBeenCalledWith({
        documentId: DOCUMENT_ID,
        title: "My New Title",
      });
    });
  });

  it("does not persist when the title is unchanged", async () => {
    startEdit();
    fireEvent.click(screen.getByRole("button", { name: "Old Title" }));
    fireEvent.blur(screen.getByTestId("title-input") as HTMLInputElement);

    await vi.waitFor(() => {
      expect(updateTitleFn).not.toHaveBeenCalled();
    });
  });

  it("does not persist an emptied heading and reverts to the saved title", async () => {
    startEdit();
    fireEvent.click(screen.getByRole("button", { name: "Old Title" }));
    const input = screen.getByTestId("title-input") as HTMLInputElement;
    editValue(input, "");
    fireEvent.blur(input);

    // Backend rejects empty/"Untitled" titles, so nothing is sent and the
    // field snaps back to the last persisted title.
    await vi.waitFor(() => {
      expect(updateTitleFn).not.toHaveBeenCalled();
    });
    expect(screen.getByRole("button", { name: "Old Title" })).toBeInTheDocument();
  });

  it("persists via updateTitle even when initialTitle tracks the typed title (new route feedback loop)", async () => {
    // Simulates a parent feeding the live typed value back into initialTitle.
    // The component must still persist the change through updateTitle.
    function FeedbackHarness() {
      const [title, setTitle] = useState("Old Title");
      return (
        <EditableDocumentTitle
          documentId={DOCUMENT_ID}
          initialTitle={title}
          isEditable
          onTitleChange={setTitle}
        />
      );
    }

    render(<FeedbackHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Old Title" }));
    const input = screen.getByTestId("title-input") as HTMLInputElement;
    editValue(input, "Brand New");
    fireEvent.blur(input);

    await vi.waitFor(() => {
      expect(updateTitleFn).toHaveBeenCalledWith({
        documentId: DOCUMENT_ID,
        title: "Brand New",
      });
    });
  });

  it("reverts on Escape without saving", async () => {
    startEdit();
    fireEvent.click(screen.getByRole("button", { name: "Old Title" }));
    const input = screen.getByTestId("title-input") as HTMLInputElement;
    editValue(input, "Changed");
    fireEvent.keyDown(input, { key: "Escape" });

    await vi.waitFor(() => {
      expect(updateTitleFn).not.toHaveBeenCalled();
    });
    expect(screen.getByRole("button", { name: "Old Title" })).toBeInTheDocument();
  });

  it("notifies the onTitleChange tracker as the user types", () => {
    const onChange = vi.fn();
    startEdit({ onTitleChange: onChange });
    fireEvent.click(screen.getByRole("button", { name: "Old Title" }));
    editValue(screen.getByTestId("title-input") as HTMLInputElement, "Typed");

    expect(onChange).toHaveBeenLastCalledWith("Typed");
  });

  it("toasts when the rename deleted an old slug", async () => {
    updateTitleFn.mockResolvedValue({ slugDeleted: "old-slug" });
    startEdit();
    fireEvent.click(screen.getByRole("button", { name: "Old Title" }));
    const input = screen.getByTestId("title-input") as HTMLInputElement;
    editValue(input, "New");
    fireEvent.blur(input);

    await vi.waitFor(() => {
      expect(toastInfo).toHaveBeenCalledWith("Title updated", {
        description: "Old URL /editor/old-slug is no longer accessible",
      });
    });
  });
});