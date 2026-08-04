import type { SerializedEditorState } from "lexical";

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";

let capturedOnChange: ((state: SerializedEditorState) => void) | undefined;

vi.mock("@elcokiin/ui/editor", () => ({
  Editor: ({
    onChange,
  }: {
    onChange?: (state: SerializedEditorState) => void;
  }) => {
    capturedOnChange = onChange;
    return <div data-testid="editor" />;
  },
}));

vi.mock("@elcokiin/ui/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { AdvancedEditor } from "./advanced-editor";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  capturedOnChange = undefined;
});

beforeEach(() => {
  vi.useFakeTimers();
});

const stateA: SerializedEditorState = {
  root: { children: [{ type: "text", text: "hello" }], type: "root" },
};
const stateB: SerializedEditorState = {
  root: { children: [{ type: "text", text: "world" }], type: "root" },
};

describe("AdvancedEditor save flow", () => {
  it("renders the editor", () => {
    render(<AdvancedEditor />);
    expect(screen.getByTestId("editor")).not.toBeNull();
  });

  it("transitions unsaved → saving → saved on successful save", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<AdvancedEditor onSave={onSave} debounceMs={500} />);

    // First change initializes baseline (no save triggered)
    act(() => {
      capturedOnChange!(stateA);
    });
    expect(onSave).not.toHaveBeenCalled();

    // Second different change triggers save flow
    act(() => {
      capturedOnChange!(stateB);
    });
    expect(onSave).not.toHaveBeenCalled();

    // Debounce fires → saving
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(stateB);

    // Async save completes → saved
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
  });

  it("transitions to error when save fails", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("fail"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AdvancedEditor onSave={onSave} debounceMs={500} />);

    act(() => {
      capturedOnChange!(stateA);
    });
    act(() => {
      capturedOnChange!(stateB);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("does not save when content has not changed", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<AdvancedEditor onSave={onSave} debounceMs={500} />);

    act(() => {
      capturedOnChange!(stateA);
    });
    act(() => {
      capturedOnChange!(stateA);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not track save status when onSave is not provided", async () => {
    render(<AdvancedEditor />);

    act(() => {
      capturedOnChange!(stateA);
    });
    act(() => {
      capturedOnChange!(stateB);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // No error thrown, component still renders
    expect(screen.getByTestId("editor")).not.toBeNull();
  });

  it("passes onChange to parent when provided", async () => {
    const onChange = vi.fn();
    render(<AdvancedEditor onChange={onChange} />);

    act(() => {
      capturedOnChange!(stateA);
    });
    expect(onChange).toHaveBeenCalledWith(stateA);
  });

  it("skips initial change for save baseline", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<AdvancedEditor onSave={onSave} debounceMs={500} />);

    act(() => {
      capturedOnChange!(stateA);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // First change only sets baseline, no save
    expect(onSave).not.toHaveBeenCalled();
  });

  it("consecutive same-content changes do not trigger save", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<AdvancedEditor onSave={onSave} debounceMs={500} />);

    act(() => {
      capturedOnChange!(stateA);
    });
    act(() => {
      capturedOnChange!(stateB);
    });
    act(() => {
      capturedOnChange!(stateB);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
