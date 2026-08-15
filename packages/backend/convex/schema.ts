import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const phrase = v.object({
  text: v.string(),
  source: v.optional(v.string()),
  year: v.optional(v.number()),
  context: v.optional(v.string()),
});

const coverImage = v.object({
  storageId: v.optional(v.string()),
  prompt: v.optional(v.string()),
});

const documentType = v.union(
  v.literal("own"),
  v.literal("reprint"),
  v.literal("inspiration"),
);

const documentStatus = v.union(
  v.literal("building"),
  v.literal("pending"),
  v.literal("published"),
);

const reprintData = v.object({
  originalAuthor: v.string(),
  originalAuthorId: v.optional(v.id("authors")),
  originalTitle: v.optional(v.string()),
  originalDate: v.optional(v.number()),
  sourceUrl: v.optional(v.string()),
  license: v.optional(v.string()),
  translator: v.optional(v.string()),
  notes: v.optional(v.string()),
});

const inspiration = v.object({
  url: v.optional(v.string()),
  title: v.string(),
  author: v.optional(v.string()),
  note: v.optional(v.string()),
  emoji: v.string(),
});

const slugHistoryEntry = v.object({
  slug: v.string(),
  createdAt: v.number(),
});

const socialLink = v.object({
  platform: v.string(),
  url: v.string(),
  label: v.optional(v.string()),
  image: v.optional(v.string()),
});

const hobby = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  emoji: v.optional(v.string()),
});

const song = v.object({
  title: v.string(),
  artist: v.string(),
  youtubeId: v.optional(v.string()),
});

const playlist = v.object({
  spotifyPlaylistId: v.optional(v.string()),
  songs: v.optional(v.array(song)),
});

const projectImage = v.object({
  storageId: v.optional(v.string()),
  url: v.string(),
  alt: v.optional(v.string()),
});

const experienceType = v.union(
  v.literal("work"),
  v.literal("education"),
  v.literal("certification"),
);

const skillLevel = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
  v.literal("expert"),
);

const projectSkillRole = v.union(
  v.literal("core"),
  v.literal("secondary"),
);

export default defineSchema({
  authors: defineTable({
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.string()),
    userId: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    bio: v.optional(v.string()),
    phrases: v.optional(v.array(phrase)),
    isVerified: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_isVerified", ["isVerified"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["isVerified"],
    }),

  documents: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.any(),
    description: v.optional(v.string()),
    coverImage: v.optional(coverImage),
    imageStorageIds: v.optional(v.array(v.string())),
    type: documentType,
    status: documentStatus,
    authorId: v.id("authors"),
    reprint: v.optional(reprintData),
    inspirations: v.optional(v.array(inspiration)),
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
    estimatedReadTime: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    order: v.optional(v.number()),
    submittedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    submissionHistory: v.optional(v.array(v.number())),
    slugHistory: v.optional(v.array(slugHistoryEntry)),
  })
    .index("by_author", ["authorId"])
    .index("by_status", ["status", "createdAt"])
    .index("by_published", ["status", "publishedAt"])
    .index("by_published_order", ["status", "order"])
    .index("by_slug", ["slug"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status"],
    }),

  documentStats: defineTable({
    buildingCount: v.number(),
    pendingCount: v.number(),
    publishedCount: v.number(),
    updatedAt: v.number(),
  }),

  writingActivity: defineTable({
    authorId: v.id("authors"),
    date: v.string(),
    words: v.number(),
    publishedWithType: v.optional(
      v.array(
        v.object({
          type: documentType,
          documentId: v.id("documents"),
        }),
      ),
    ),
  })
    .index("by_author_date", ["authorId", "date"]),

  portfolio: defineTable({
    name: v.string(),
    headline: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.string()),
    about: v.optional(v.string()),
    philosophy: v.optional(v.string()),
    socialLinks: v.optional(v.array(socialLink)),
    hobbies: v.optional(v.array(hobby)),
    playlist: v.optional(playlist),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  skills: defineTable({
    name: v.string(),
    category: v.string(),
    level: v.optional(skillLevel),
    firstUsedAt: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    icon: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_category_and_name", ["category", "name"])
    .index("by_visible", ["isVisible"])
    .index("by_category_visible", ["category", "isVisible"]),

  projects: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    philosophy: v.optional(v.string()),
    keyKnowledge: v.optional(v.array(v.string())),
    keyFeatures: v.optional(v.array(v.string())),
    url: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    images: v.optional(v.array(projectImage)),
    order: v.number(),
    isVisible: v.optional(v.boolean()),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_visible", ["isVisible"])
    .index("by_order", ["order"]),

  experience: defineTable({
    type: experienceType,
    title: v.string(),
    organization: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isCurrent: v.optional(v.boolean()),
    durationHours: v.optional(v.number()),
    credentialId: v.optional(v.string()),
    credentialUrl: v.optional(v.string()),
    order: v.number(),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_order", ["order"]),

  projectSkills: defineTable({
    projectId: v.id("projects"),
    skillId: v.id("skills"),
    role: v.optional(projectSkillRole),
  })
    .index("by_project", ["projectId"])
    .index("by_skill", ["skillId"])
    .index("by_project_and_skill", ["projectId", "skillId"]),

  experienceSkills: defineTable({
    experienceId: v.id("experience"),
    skillId: v.id("skills"),
  })
    .index("by_experience", ["experienceId"])
    .index("by_skill", ["skillId"])
    .index("by_experience_and_skill", ["experienceId", "skillId"]),
});
