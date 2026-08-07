import { z } from "zod";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { AdminExperience } from "@elcokiin/backend/lib/types/portfolio";

export const experienceSchema = z
  .object({
    type: z.enum(["work", "education", "certification"]),
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(120, "Title must be under 120 characters"),
    organization: z
      .string()
      .trim()
      .min(1, "Organization is required")
      .max(120, "Organization must be under 120 characters"),
    description: z.string().max(2000, "Description must be under 2000 characters").optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional().default(false),
    durationHours: z
      .number()
      .min(0, "Duration must be 0 or greater")
      .optional(),
    credentialId: z.string().max(120, "Credential ID must be under 120 characters").optional(),
    credentialUrl: z
      .string()
      .trim()
      .refine((value) => value === "" || /^https?:\/\/.+\..+/.test(value), {
        message: "Enter a valid URL starting with http:// or https://",
      })
      .optional(),
    skillIds: z.array(z.custom<Id<"skills">>()).optional().default([]),
    order: z.number().min(0, "Order must be 0 or greater"),
  })
  .superRefine((value, ctx) => {
    if (
      !value.isCurrent &&
      value.startDate &&
      value.endDate &&
      value.endDate < value.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date can't be before the start date",
      });
    }
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
    skillIds: entry?.skills?.map((skill) => skill._id) ?? [],
    order: entry?.order ?? 0,
  };
}
