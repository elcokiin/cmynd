import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SaveStatusProvider, type SaveStatus } from "@/components/editor/context/save-status-context";
import { SaveStatusToolbarPlugin } from "./save-status-toolbar-plugin";

function Wrapper({ saveStatus }: { saveStatus: SaveStatus }) {
  return (
    <SaveStatusProvider value={saveStatus}>
      <SaveStatusToolbarPlugin />
    </SaveStatusProvider>
  );
}

afterEach(cleanup);

function getDot(container: HTMLElement): HTMLElement {
  const dot = container.querySelector("span.rounded-full");
  if (!dot) throw new Error("Dot element not found");
  return dot as HTMLElement;
}

describe("SaveStatusToolbarPlugin", () => {
  it("renders green dot when saved", () => {
    const { container } = render(<Wrapper saveStatus="saved" />);
    expect(getDot(container)).toHaveClass("bg-green-500");
  });

  it("renders yellow dot when saving", () => {
    const { container } = render(<Wrapper saveStatus="saving" />);
    expect(getDot(container)).toHaveClass("bg-yellow-500");
  });

  it("renders orange dot when unsaved", () => {
    const { container } = render(<Wrapper saveStatus="unsaved" />);
    expect(getDot(container)).toHaveClass("bg-orange-500");
  });

  it("renders red dot when error", () => {
    const { container } = render(<Wrapper saveStatus="error" />);
    expect(getDot(container)).toHaveClass("bg-red-500");
  });

  it("dot has transition class for smooth color changes", () => {
    const { container } = render(<Wrapper saveStatus="saved" />);
    expect(getDot(container)).toHaveClass("transition-colors");
  });

  it("dot has correct size classes", () => {
    const { container } = render(<Wrapper saveStatus="saved" />);
    const dot = getDot(container);
    expect(dot).toHaveClass("size-2.5");
    expect(dot).toHaveClass("rounded-full");
  });

  it("renders inside a tooltip trigger", () => {
    const { container } = render(<Wrapper saveStatus="saved" />);
    const trigger = container.querySelector("[data-slot='tooltip-trigger']");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toContainElement(getDot(container));
  });

  it("updates dot color when saveStatus changes", () => {
    const { container, rerender } = render(<Wrapper saveStatus="saved" />);
    expect(getDot(container)).toHaveClass("bg-green-500");

    rerender(<Wrapper saveStatus="unsaved" />);
    expect(getDot(container)).toHaveClass("bg-orange-500");

    rerender(<Wrapper saveStatus="saving" />);
    expect(getDot(container)).toHaveClass("bg-yellow-500");

    rerender(<Wrapper saveStatus="error" />);
    expect(getDot(container)).toHaveClass("bg-red-500");
  });
});
