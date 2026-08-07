import { z } from "zod";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { AdminProject } from "@elcokiin/backend/lib/types/portfolio";

export const projectImageSchema = z.object({
  storageId: z.string().optional(),
  url: z.string(),
  alt: z.string().optional(),
});

export const skillLinkSchema = z.object({
  skillId: z.custom<Id<"skills">>(),
  role: z.enum(["core", "secondary"]).optional(),
});

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\/.+\..+/.test(value), {
    message: "Enter a valid URL starting with http:// or https://",
  });

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be under 120 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().max(2000, "Description must be under 2000 characters").optional(),
  philosophy: z.string().max(2000, "Philosophy must be under 2000 characters").optional(),
  keyKnowledge: z.array(z.string()).optional().default([]),
  keyFeatures: z.array(z.string()).optional().default([]),
  url: optionalUrl.optional(),
  githubUrl: optionalUrl.optional(),
  skillLinks: z.array(skillLinkSchema).optional().default([]),
  images: z.array(projectImageSchema).optional().default([]),
  order: z.number().min(0, "Order must be 0 or greater"),
  isVisible: z.boolean().optional().default(true),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export function defaultFormValues(project?: AdminProject): ProjectFormValues {
  return {
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    description: project?.description ?? "",
    philosophy: project?.philosophy ?? "",
    keyKnowledge: project?.keyKnowledge ?? [],
    keyFeatures: project?.keyFeatures ?? [],
    url: project?.url ?? "",
    githubUrl: project?.githubUrl ?? "",
    skillLinks:
      project?.skills?.map((skill) => ({
        skillId: skill._id,
        role: skill.role,
      })) ?? [],
    images: project?.images ?? [],
    order: project?.order ?? 0,
    isVisible: project?.isVisible ?? true,
  };
}
