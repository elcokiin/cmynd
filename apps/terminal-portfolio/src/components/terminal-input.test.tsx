import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import type { Mock } from "vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TerminalInput } from "./terminal-input";

describe("TerminalInput Component", () => {
  let onSubmitMock: Mock;

  beforeEach(() => {
    onSubmitMock = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with default prompt", () => {
    render(<TerminalInput onSubmit={onSubmitMock} />);
    expect(screen.getByText("diegotenjo@elcokiin ~ $")).toBeDefined();
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("submits commands on Enter", () => {
    render(<TerminalInput onSubmit={onSubmitMock} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    act(() => {
      fireEvent.change(input, { target: { value: "ls" } });
    });
    expect(input.value).toBe("ls");

    act(() => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(onSubmitMock).toHaveBeenCalledWith("ls");
    expect(input.value).toBe("");
  });

  it("handles history with ArrowUp and ArrowDown keys", () => {
    render(<TerminalInput onSubmit={onSubmitMock} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    // Submit command 1
    act(() => {
      fireEvent.change(input, { target: { value: "cd /" } });
      fireEvent.keyDown(input, { key: "Enter" });
    });

    // Submit command 2
    act(() => {
      fireEvent.change(input, { target: { value: "ls" } });
      fireEvent.keyDown(input, { key: "Enter" });
    });

    // Press ArrowUp once
    act(() => {
      fireEvent.keyDown(input, { key: "ArrowUp" });
    });
    expect(input.value).toBe("ls");

    // Press ArrowUp twice
    act(() => {
      fireEvent.keyDown(input, { key: "ArrowUp" });
    });
    expect(input.value).toBe("cd /");

    // Press ArrowDown once
    act(() => {
      fireEvent.keyDown(input, { key: "ArrowDown" });
    });
    expect(input.value).toBe("ls");

    // Press ArrowDown twice
    act(() => {
      fireEvent.keyDown(input, { key: "ArrowDown" });
    });
    expect(input.value).toBe("");
  });

  it("strips borders via Tailwind classes", () => {
    render(<TerminalInput onSubmit={onSubmitMock} />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-none");
    expect(input.className).toContain("focus-visible:ring-0");
    expect(input.className).toContain("focus-visible:ring-offset-0");
  });
});
