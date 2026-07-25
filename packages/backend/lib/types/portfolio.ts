import type { Doc, Id } from "../../convex/_generated/dataModel";

// ── Nested types ──────────────────────────────────────────────────────

export type SocialLink = {
  platform: string;
  url: string;
  label?: string;
};

export type Hobby = {
  name: string;
  description?: string;
  emoji?: string;
};

export type Song = {
  title: string;
  artist: string;
  youtubeId?: string;
};

export type Playlist = {
  spotifyPlaylistId?: string;
  songs?: Song[];
};

export type ProjectImage = {
  storageId?: string;
  url: string;
  alt?: string;
};

// ── Experience type ───────────────────────────────────────────────────

export type ExperienceType = "work" | "education" | "certification";

// ── Raw database types ────────────────────────────────────────────────

export type Portfolio = Doc<"portfolio">;
export type Skill = Doc<"skills">;
export type Project = Doc<"projects">;
export type Experience = Doc<"experience">;

// ── Public types (safe for external use) ──────────────────────────────

export type PublicPortfolio = {
  _id: Id<"portfolio">;
  name: string;
  headline: string;
  avatarUrl?: string;
  about?: string;
  philosophy?: string;
  socialLinks?: SocialLink[];
  hobbies?: Hobby[];
  playlist?: Playlist;
  createdAt: number;
  updatedAt: number;
};

export type PublicSkill = {
  _id: Id<"skills">;
  name: string;
  category: string;
  proficiency?: number;
  icon?: string;
};

export type PublicProject = {
  _id: Id<"projects">;
  title: string;
  slug: string;
  description?: string;
  philosophy?: string;
  keyKnowledge?: string[];
  keyFeatures?: string[];
  url?: string;
  githubUrl?: string;
  technologies?: string[];
  images?: ProjectImage[];
  order: number;
};

export type PublicExperience = {
  _id: Id<"experience">;
  type: ExperienceType;
  title: string;
  organization: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  durationHours?: number;
  credentialId?: string;
  credentialUrl?: string;
  technologies?: string[];
  order: number;
};

// ── Admin types (includes management fields) ──────────────────────────

export type AdminPortfolio = PublicPortfolio & {
  createdBy?: string;
};

export type AdminSkill = {
  _id: Id<"skills">;
  name: string;
  category: string;
  proficiency?: number;
  isVisible?: boolean;
  icon?: string;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
};

export type AdminProject = {
  _id: Id<"projects">;
  title: string;
  slug: string;
  description?: string;
  philosophy?: string;
  keyKnowledge?: string[];
  keyFeatures?: string[];
  url?: string;
  githubUrl?: string;
  technologies?: string[];
  images?: ProjectImage[];
  order: number;
  isVisible?: boolean;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
};

export type AdminExperience = {
  _id: Id<"experience">;
  type: ExperienceType;
  title: string;
  organization: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  durationHours?: number;
  credentialId?: string;
  credentialUrl?: string;
  technologies?: string[];
  order: number;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
};
