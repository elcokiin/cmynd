import { describe, expect, it } from "vitest";

import { groupByYear } from "./activity-heatmap";

type ActivityDay = {
  date: string;
  value: number;
  publishedWithType?: { type: "own" | "reprint" | "inspiration"; documentId: string }[];
};

describe("groupByYear", () => {
  it("returns all 365 days for a year with data", () => {
    const data: ActivityDay[] = [
      { date: "2026-03-15", value: 200 },
      { date: "2026-07-01", value: 50 },
    ];

    const result = groupByYear(data);
    const year2026 = result.get(2026);

    expect(year2026).toBeDefined();
    expect(year2026!.length).toBe(365);
  });

  it("pads missing days with value 0", () => {
    const data: ActivityDay[] = [{ date: "2026-06-10", value: 300 }];

    const result = groupByYear(data);
    const year2026 = result.get(2026)!;

    const jan1 = year2026.find((d) => d.date === "2026-01-01");
    expect(jan1).toEqual({ date: "2026-01-01", value: 0 });

    const jun10 = year2026.find((d) => d.date === "2026-06-10");
    expect(jun10).toEqual({ date: "2026-06-10", value: 300 });

    const dec31 = year2026.find((d) => d.date === "2026-12-31");
    expect(dec31).toEqual({ date: "2026-12-31", value: 0 });
  });

  it("preserves publishedWithType on days with data", () => {
    const data: ActivityDay[] = [
      {
        date: "2026-04-20",
        value: 100,
        publishedWithType: [{ type: "own", documentId: "doc1" }],
      },
    ];

    const result = groupByYear(data);
    const year2026 = result.get(2026)!;
    const apr20 = year2026.find((d) => d.date === "2026-04-20");

    expect(apr20?.publishedWithType).toEqual([{ type: "own", documentId: "doc1" }]);
  });

  it("groups data across multiple years", () => {
    const data: ActivityDay[] = [
      { date: "2025-01-01", value: 10 },
      { date: "2026-06-15", value: 20 },
    ];

    const result = groupByYear(data);

    expect(result.has(2025)).toBe(true);
    expect(result.has(2026)).toBe(true);
    expect(result.get(2025)!.length).toBe(365);
    expect(result.get(2026)!.length).toBe(365);
  });

  it("returns empty map for empty data", () => {
    const result = groupByYear([]);
    expect(result.size).toBe(0);
  });

  it("days are ordered chronologically within each year", () => {
    const data: ActivityDay[] = [{ date: "2026-12-25", value: 50 }];

    const result = groupByYear(data);
    const year2026 = result.get(2026)!;

    expect(year2026[0]!.date).toBe("2026-01-01");
    expect(year2026[year2026.length - 1]!.date).toBe("2026-12-31");

    for (let i = 1; i < year2026.length; i++) {
      expect(year2026[i]!.date > year2026[i - 1]!.date).toBe(true);
    }
  });
});
