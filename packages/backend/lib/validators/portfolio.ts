import { v } from "convex/values";

// ── Nested object primitives ──────────────────────────────────────────

export const socialLinkValidator = v.object({
  platform: v.string(),
  url: v.string(),
  label: v.optional(v.string()),
});

export const hobbyValidator = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  emoji: v.optional(v.string()),
});

export const songValidator = v.object({
  title: v.string(),
  artist: v.string(),
  youtubeId: v.optional(v.string()),
});

export const playlistValidator = v.object({
  spotifyPlaylistId: v.optional(v.string()),
  songs: v.optional(v.array(songValidator)),
});

export const projectImageValidator = v.object({
  storageId: v.optional(v.string()),
  url: v.string(),
  alt: v.optional(v.string()),
});

// ── Experience type ───────────────────────────────────────────────────

export const experienceTypeValidator = v.union(
  v.literal("work"),
  v.literal("education"),
  v.literal("certification"),
);

// ── Schema validators (used by defineTable in schema.ts) ──────────────

export const portfolioValidator = {
  name: v.string(),
  headline: v.string(),
  avatarUrl: v.optional(v.string()),
  about: v.optional(v.string()),
  philosophy: v.optional(v.string()),
  socialLinks: v.optional(v.array(socialLinkValidator)),
  hobbies: v.optional(v.array(hobbyValidator)),
  playlist: v.optional(playlistValidator),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const skillValidator = v.object({
  name: v.string(),
  category: v.string(),
  proficiency: v.optional(v.number()),
  isVisible: v.optional(v.boolean()),
  icon: v.optional(v.string()),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const projectValidator = v.object({
  title: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  philosophy: v.optional(v.string()),
  keyKnowledge: v.optional(v.array(v.string())),
  keyFeatures: v.optional(v.array(v.string())),
  url: v.optional(v.string()),
  githubUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  images: v.optional(v.array(projectImageValidator)),
  order: v.number(),
  isVisible: v.optional(v.boolean()),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const experienceValidator = v.object({
  type: experienceTypeValidator,
  title: v.string(),
  organization: v.string(),
  description: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  isCurrent: v.optional(v.boolean()),
  durationHours: v.optional(v.number()),
  credentialId: v.optional(v.string()),
  credentialUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  order: v.number(),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// ── Query return validators (public) ──────────────────────────────────

export const publicPortfolioValidator = v.object({
  _id: v.id("portfolio"),
  name: v.string(),
  headline: v.string(),
  avatarUrl: v.optional(v.string()),
  about: v.optional(v.string()),
  philosophy: v.optional(v.string()),
  socialLinks: v.optional(v.array(socialLinkValidator)),
  hobbies: v.optional(v.array(hobbyValidator)),
  playlist: v.optional(playlistValidator),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const publicSkillValidator = v.object({
  _id: v.id("skills"),
  name: v.string(),
  category: v.string(),
  proficiency: v.optional(v.number()),
  icon: v.optional(v.string()),
});

export const publicProjectValidator = v.object({
  _id: v.id("projects"),
  title: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  philosophy: v.optional(v.string()),
  keyKnowledge: v.optional(v.array(v.string())),
  keyFeatures: v.optional(v.array(v.string())),
  url: v.optional(v.string()),
  githubUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  images: v.optional(v.array(projectImageValidator)),
  order: v.number(),
});

export const publicExperienceValidator = v.object({
  _id: v.id("experience"),
  type: experienceTypeValidator,
  title: v.string(),
  organization: v.string(),
  description: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  isCurrent: v.optional(v.boolean()),
  durationHours: v.optional(v.number()),
  credentialId: v.optional(v.string()),
  credentialUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  order: v.number(),
});

// ── Query return validators (admin) ───────────────────────────────────

export const adminPortfolioValidator = v.object({
  _id: v.id("portfolio"),
  name: v.string(),
  headline: v.string(),
  avatarUrl: v.optional(v.string()),
  about: v.optional(v.string()),
  philosophy: v.optional(v.string()),
  socialLinks: v.optional(v.array(socialLinkValidator)),
  hobbies: v.optional(v.array(hobbyValidator)),
  playlist: v.optional(playlistValidator),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const adminSkillValidator = v.object({
  _id: v.id("skills"),
  name: v.string(),
  category: v.string(),
  proficiency: v.optional(v.number()),
  isVisible: v.optional(v.boolean()),
  icon: v.optional(v.string()),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const adminProjectValidator = v.object({
  _id: v.id("projects"),
  title: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  philosophy: v.optional(v.string()),
  keyKnowledge: v.optional(v.array(v.string())),
  keyFeatures: v.optional(v.array(v.string())),
  url: v.optional(v.string()),
  githubUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  images: v.optional(v.array(projectImageValidator)),
  order: v.number(),
  isVisible: v.optional(v.boolean()),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const adminExperienceValidator = v.object({
  _id: v.id("experience"),
  type: experienceTypeValidator,
  title: v.string(),
  organization: v.string(),
  description: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  isCurrent: v.optional(v.boolean()),
  durationHours: v.optional(v.number()),
  credentialId: v.optional(v.string()),
  credentialUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  order: v.number(),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// ── Mutation arg validators ───────────────────────────────────────────

export const upsertSkillArgsValidator = v.object({
  _id: v.optional(v.id("skills")),
  name: v.string(),
  category: v.string(),
  proficiency: v.optional(v.number()),
  isVisible: v.optional(v.boolean()),
  icon: v.optional(v.string()),
});

export const createProjectArgsValidator = v.object({
  title: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  philosophy: v.optional(v.string()),
  keyKnowledge: v.optional(v.array(v.string())),
  keyFeatures: v.optional(v.array(v.string())),
  url: v.optional(v.string()),
  githubUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  images: v.optional(v.array(projectImageValidator)),
  order: v.number(),
  isVisible: v.optional(v.boolean()),
});

export const updateProjectArgsValidator = v.object({
  _id: v.id("projects"),
  title: v.optional(v.string()),
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  philosophy: v.optional(v.string()),
  keyKnowledge: v.optional(v.array(v.string())),
  keyFeatures: v.optional(v.array(v.string())),
  url: v.optional(v.string()),
  githubUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  images: v.optional(v.array(projectImageValidator)),
  order: v.optional(v.number()),
  isVisible: v.optional(v.boolean()),
});

export const createExperienceArgsValidator = v.object({
  type: experienceTypeValidator,
  title: v.string(),
  organization: v.string(),
  description: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  isCurrent: v.optional(v.boolean()),
  durationHours: v.optional(v.number()),
  credentialId: v.optional(v.string()),
  credentialUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  order: v.number(),
});

export const updateExperienceArgsValidator = v.object({
  _id: v.id("experience"),
  type: v.optional(experienceTypeValidator),
  title: v.optional(v.string()),
  organization: v.optional(v.string()),
  description: v.optional(v.string()),
  startDate: v.optional(v.string()),
  endDate: v.optional(v.string()),
  isCurrent: v.optional(v.boolean()),
  durationHours: v.optional(v.number()),
  credentialId: v.optional(v.string()),
  credentialUrl: v.optional(v.string()),
  technologies: v.optional(v.array(v.string())),
  order: v.optional(v.number()),
});
