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

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  philosophy: z.string().optional(),
  keyKnowledge: z.array(z.string()).optional().default([]),
  keyFeatures: z.array(z.string()).optional().default([]),
  url: z.string().optional(),
  githubUrl: z.string().optional(),
  skillLinks: z.array(skillLinkSchema).optional().default([]),
  images: z.array(projectImageSchema).optional().default([]),
  order: z.number().min(0),
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
