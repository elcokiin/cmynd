"use client";

import { api } from "@elcokiin/backend/convex/_generated/api";
import type { DocumentType } from "@elcokiin/backend/lib/types/documents";
import { Button } from "@elcokiin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@elcokiin/ui/dialog";
import {
  CalendarHeatmap,
  CalendarHeatmapBlock,
  CalendarHeatmapBody,
  CalendarHeatmapFooter,
  CalendarHeatmapStat,
} from "@elcokiin/ui/heatmap";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@elcokiin/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@elcokiin/ui/tabs";
import { useQuery } from "convex/react";
import { CalendarDaysIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { documentTypeConfig } from "./document-type-config";

type PublishedEntry = { type: DocumentType; documentId: string };

type ActivityDay = {
  date: string;
  value: number;
  publishedWithType?: PublishedEntry[];
};

type AugmentedActivity = {
  date: string;
  value: number;
  level: number;
  publishedWithType?: PublishedEntry[];
};

const TYPE_COLOR: Record<DocumentType, string> = {
  own: "var(--color-chart-2)",
  reprint: "var(--color-chart-3)",
  inspiration: "var(--color-chart-4)",
};

const CREATION_DAY_COLOR = "var(--color-chart-5)";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${MONTHS[(month ?? 1) - 1]} ${day}, ${year}`;
}

function wordLabel(count: number): string {
  return `${count} ${count === 1 ? "word" : "words"}`;
}

export function groupByYear(data: ActivityDay[]): Map<number, ActivityDay[]> {
  const existing = new Map<number, Map<string, ActivityDay>>();
  for (const day of data) {
    const year = Number(day.date.split("-")[0]);
    if (!existing.has(year)) existing.set(year, new Map());
    existing.get(year)!.set(day.date, day);
  }

  const grouped = new Map<number, ActivityDay[]>();
  for (const [year, byDate] of existing) {
    const days: ActivityDay[] = [];
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${year}-${m}-${day}`;
      days.push(byDate.get(key) ?? { date: key, value: 0 });
    }
    grouped.set(year, days);
  }
  return grouped;
}

export function ActivityHeatmapButton(): React.ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(Boolean(value))}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <CalendarDaysIcon className="h-4 w-4" />
            Writing Activity
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[960px]">
        <DialogHeader>
          <DialogTitle>Writing Activity</DialogTitle>
          <DialogDescription>
            Words written per day and published documents by type.
          </DialogDescription>
        </DialogHeader>
        <ActivityHeatmap onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ActivityHeatmap({
  onClose,
}: {
  onClose: () => void;
}): React.ReactNode {
  const raw = useQuery(api.streaks.queries.getActivity);

  const authorCreatedAt = raw?.authorCreatedAt;

  const data = useMemo<ActivityDay[]>(() => {
    if (!raw) return [];
    return raw.days.map((row) => ({
      date: row.date,
      value: row.words,
      publishedWithType: row.publishedWithType,
    }));
  }, [raw]);

  const byYear = useMemo(() => groupByYear(data), [data]);
  const years = useMemo(() => Array.from(byYear.keys()).sort((a, b) => a - b), [byYear]);

  const metaByDate = useMemo(
    () => new Map(data.map((day) => [day.date, day])),
    [data],
  );

  const [activeYear, setActiveYear] = useState(() => years.at(-1) ?? new Date().getFullYear());

  if (raw === undefined) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        Loading activity...
      </div>
    );
  }

  if (years.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No writing activity yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <Tabs value={String(activeYear)} onValueChange={(v: string | number | null) => setActiveYear(Number(v))}>
        <TabsList variant="line">
          {years.map((year) => (
            <TabsTrigger key={year} value={String(year)}>
              {year}
            </TabsTrigger>
          ))}
        </TabsList>

        {years.map((year) => (
          <TabsContent key={year} value={String(year)}>
            <div className="flex justify-center overflow-x-auto rounded-md border border-border bg-muted/30 p-2">
              <CalendarHeatmap data={byYear.get(year) ?? []} weekStart={1}>
                <CalendarHeatmapBody hideYearLabels hideWeekdayLabels>
                  {({ activity: act, dayIndex, weekIndex }) => {
                    const meta = act as unknown as AugmentedActivity;
                    const published = meta.publishedWithType ?? [];
                    const type = published[0]?.type;
                    const isCreationDay = authorCreatedAt === meta.date;
                    const fill = isCreationDay
                      ? CREATION_DAY_COLOR
                      : type
                        ? TYPE_COLOR[type]
                        : undefined;
                    const dayData = metaByDate.get(meta.date);

                    return (
                      <HoverCard>
                        <HoverCardTrigger
                          render={
                            <CalendarHeatmapBlock
                              activity={act}
                              dayIndex={dayIndex}
                              weekIndex={weekIndex}
                              style={fill ? { fill } : undefined}
                            />
                          }
                        />
                        {dayData && (
                          <HoverCardContent side="top" sideOffset={8} className="w-56 p-3">
                            <div className="font-medium text-foreground">
                              {formatDayLabel(dayData.date)}
                            </div>
                            {isCreationDay && (
                              <div className="text-xs font-medium" style={{ color: CREATION_DAY_COLOR }}>
                                First document created
                              </div>
                            )}
                            <div className="text-muted-foreground">
                              {wordLabel(dayData.value)} written
                            </div>
                            {dayData.publishedWithType &&
                              dayData.publishedWithType.length > 0 && (
                                <div className="mt-2 flex flex-col gap-1">
                                  {dayData.publishedWithType.map((entry) => {
                                    const config = documentTypeConfig[entry.type];
                                    const Icon = config.icon;
                                    return (
                                      <div
                                        key={entry.documentId}
                                        className="flex items-center gap-2 text-xs"
                                        style={{ color: TYPE_COLOR[entry.type] }}
                                      >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span>{config.label}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                          </HoverCardContent>
                        )}
                      </HoverCard>
                    );
                  }}
                </CalendarHeatmapBody>
                <CalendarHeatmapFooter>
                  <CalendarHeatmapStat
                    compute={(d) => d.reduce((s, a) => s + a.value, 0)}
                  >
                    {({ value, year }) => (
                      <span className="text-muted-foreground tabular-nums">
                        {wordLabel(value as number)} in {year}
                      </span>
                    )}
                  </CalendarHeatmapStat>
                  <TypeLegend />
                </CalendarHeatmapFooter>
              </CalendarHeatmap>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="mt-4 w-full"
      >
        Close
      </Button>
    </div>
  );
}

function TypeLegend(): React.ReactNode {
  return (
    <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {Object.entries(documentTypeConfig).map(([type, config]) => {
        const key = type as DocumentType;
        const Icon = config.icon;
        return (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-[2px]"
              style={{ backgroundColor: TYPE_COLOR[key] }}
            />
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
