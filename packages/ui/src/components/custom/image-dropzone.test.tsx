import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ImageDropzone } from "./image-dropzone";

afterEach(cleanup);

function createFile(name = "test.png", size = 1024, type = "image/png") {
  return new File([new ArrayBuffer(size)], name, { type });
}

function getDropzoneRoot(): HTMLElement {
  const input = screen.getByLabelText("Upload image");
  return input.parentElement!;
}

describe("ImageDropzone", () => {
  it("renders default state with upload icon and instructions", () => {
    render(<ImageDropzone onDrop={vi.fn()} />);

    expect(screen.getByText("Drag & drop or click to upload")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload image")).toBeInTheDocument();
  });

  it("shows uploading state with spinner and status text", () => {
    render(<ImageDropzone onDrop={vi.fn()} isUploading />);

    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    expect(getDropzoneRoot()).toHaveClass("pointer-events-none");
    expect(getDropzoneRoot()).toHaveClass("opacity-60");
  });

  it("shows hint text when provided", () => {
    render(<ImageDropzone onDrop={vi.fn()} hint="Recommended: 735 × 490 px" />);

    expect(screen.getByText("Recommended: 735 × 490 px")).toBeInTheDocument();
  });

  it("applies aspect-video classes when aspectRatio is video", () => {
    render(<ImageDropzone onDrop={vi.fn()} aspectRatio="video" />);

    expect(getDropzoneRoot()).toHaveClass("aspect-video");
    expect(getDropzoneRoot()).toHaveClass("w-full");
  });

  it("applies p-6 by default when aspectRatio is none", () => {
    render(<ImageDropzone onDrop={vi.fn()} />);

    expect(getDropzoneRoot()).toHaveClass("p-6");
  });

  it("applies disabled styles when disabled", () => {
    render(<ImageDropzone onDrop={vi.fn()} disabled />);

    expect(getDropzoneRoot()).toHaveClass("pointer-events-none");
    expect(getDropzoneRoot()).toHaveClass("opacity-60");
  });

  it("renders custom children instead of defaults", () => {
    render(
      <ImageDropzone onDrop={vi.fn()}>
        <div data-testid="custom-child">Custom content</div>
      </ImageDropzone>,
    );

    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.getByText("Custom content")).toBeInTheDocument();
    expect(screen.queryByText("Drag & drop or click to upload")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ImageDropzone onDrop={vi.fn()} className="custom-class" />);

    expect(getDropzoneRoot()).toHaveClass("custom-class");
  });

  it("calls onDrop when a file is uploaded via the input", async () => {
    const onDrop = vi.fn();
    render(<ImageDropzone onDrop={onDrop} />);

    const input = screen.getByLabelText("Upload image");
    const file = createFile();

    await userEvent.upload(input, file);

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(file);
  });

  it("accepts image files by default", () => {
    render(<ImageDropzone onDrop={vi.fn()} />);

    const input = screen.getByLabelText("Upload image");
    expect(input).toHaveAttribute("accept", "image/*");
  });
});
