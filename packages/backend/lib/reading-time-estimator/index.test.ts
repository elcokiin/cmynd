import { describe, it, expect } from "vitest";
import { getReadingTimeMinutes } from "./index";

describe("getReadingTimeMinutes", () => {
  it("returns 0 for empty text", () => {
    expect(getReadingTimeMinutes("")).toBe(0);
  });

  it("returns 0 for whitespace-only text", () => {
    expect(getReadingTimeMinutes("   \n\t  ")).toBe(0);
  });

  it("returns at least 1 for a single word (never hides short posts)", () => {
    expect(getReadingTimeMinutes("Hello")).toBe(1);
  });

  it("returns 1 for short content under 100 words (regression: was 0 and hidden)", () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i + 1}`).join(" ");
    expect(getReadingTimeMinutes(words)).toBe(1);
  });

  it("returns 1 for 100 words", () => {
    const words = Array.from({ length: 100 }, (_, i) => `word${i + 1}`).join(" ");
    expect(getReadingTimeMinutes(words)).toBe(1);
  });

  it("returns 2 for 300 words", () => {
    const words = Array.from({ length: 300 }, (_, i) => `word${i + 1}`).join(" ");
    expect(getReadingTimeMinutes(words)).toBe(2);
  });

  it("returns 3 for 500 words", () => {
    const words = Array.from({ length: 500 }, (_, i) => `word${i + 1}`).join(" ");
    expect(getReadingTimeMinutes(words)).toBe(3);
  });

  it("returns 5 for 1000 words", () => {
    const words = Array.from({ length: 1000 }, (_, i) => `word${i + 1}`).join(" ");
    expect(getReadingTimeMinutes(words)).toBe(5);
  });

  it("returns at least 1 for Spanish text with accents", () => {
    const words = Array.from(
      { length: 60 },
      (_, i) => `palabra${i + 1}`,
    ).join(" ");
    expect(getReadingTimeMinutes(`El documento ${words} añadido`)).toBe(1);
  });
});