import { z } from "zod";
import type { AdminExperience } from "@elcokiin/backend/lib/types/portfolio";

export const experienceSchema = z.object({
  type: z.enum(["work", "education", "certification"]),
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional().default(false),
  durationHours: z.number().min(0).optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  technologies: z.array(z.string()).optional().default([]),
  order: z.number().min(0),
});

export function defaultFormValues(
  entry?: AdminExperience,
): z.infer<typeof experienceSchema> {
  return {
    type: entry?.type ?? "work",
    title: entry?.title ?? "",
    organization: entry?.organization ?? "",
    description: entry?.description ?? "",
    startDate: entry?.startDate ?? "",
    endDate: entry?.endDate ?? "",
    isCurrent: entry?.isCurrent ?? false,
    durationHours: entry?.durationHours ?? 0,
    credentialId: entry?.credentialId ?? "",
    credentialUrl: entry?.credentialUrl ?? "",
    technologies: entry?.technologies ?? [],
    order: entry?.order ?? 0,
  };
}
