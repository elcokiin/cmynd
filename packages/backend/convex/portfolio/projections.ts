import type { Doc } from "../_generated/dataModel";
import type {
  PublicSkill,
  PublicProject,
  PublicExperience,
  AdminSkill,
  AdminProject,
  AdminExperience,
  SkillReference,
} from "../../lib/types/portfolio";

// ── Skill projections ─────────────────────────────────────────────────

export function toSkillReference(skill: Doc<"skills">): SkillReference {
  return {
    _id: skill._id,
    name: skill.name,
    category: skill.category,
    level: skill.level,
    icon: skill.icon,
  };
}

export function toPublicSkill(skill: Doc<"skills">): PublicSkill {
  return {
    _id: skill._id,
    name: skill.name,
    category: skill.category,
    level: skill.level,
    icon: skill.icon,
  };
}

export function toAdminSkill(skill: Doc<"skills">): AdminSkill {
  return {
    _id: skill._id,
    name: skill.name,
    category: skill.category,
    level: skill.level,
    firstUsedAt: skill.firstUsedAt,
    isVisible: skill.isVisible,
    icon: skill.icon,
    createdBy: skill.createdBy,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
}

// ── Project projections ───────────────────────────────────────────────

export function toPublicProject(project: Doc<"projects">): PublicProject {
  return {
    _id: project._id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    philosophy: project.philosophy,
    keyKnowledge: project.keyKnowledge,
    keyFeatures: project.keyFeatures,
    url: project.url,
    githubUrl: project.githubUrl,
    images: project.images,
    order: project.order,
  };
}

export function toAdminProject(project: Doc<"projects">): AdminProject {
  return {
    _id: project._id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    philosophy: project.philosophy,
    keyKnowledge: project.keyKnowledge,
    keyFeatures: project.keyFeatures,
    url: project.url,
    githubUrl: project.githubUrl,
    images: project.images,
    order: project.order,
    isVisible: project.isVisible,
    createdBy: project.createdBy,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

// ── Experience projections ────────────────────────────────────────────

export function toPublicExperience(
  experience: Doc<"experience">,
): PublicExperience {
  return {
    _id: experience._id,
    type: experience.type,
    title: experience.title,
    organization: experience.organization,
    description: experience.description,
    startDate: experience.startDate,
    endDate: experience.endDate,
    isCurrent: experience.isCurrent,
    durationHours: experience.durationHours,
    credentialId: experience.credentialId,
    credentialUrl: experience.credentialUrl,
    order: experience.order,
  };
}

export function toAdminExperience(
  experience: Doc<"experience">,
): AdminExperience {
  return {
    _id: experience._id,
    type: experience.type,
    title: experience.title,
    organization: experience.organization,
    description: experience.description,
    startDate: experience.startDate,
    endDate: experience.endDate,
    isCurrent: experience.isCurrent,
    durationHours: experience.durationHours,
    credentialId: experience.credentialId,
    credentialUrl: experience.credentialUrl,
    order: experience.order,
    createdBy: experience.createdBy,
    createdAt: experience.createdAt,
    updatedAt: experience.updatedAt,
  };
}
