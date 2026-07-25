import { ConvexHttpClient } from "convex/browser";
import { api } from "@elcokiin/backend/convex/_generated/api";
import type { PublicPortfolio, PublicSkill, PublicProject, PublicExperience } from "@elcokiin/backend/lib/types/portfolio";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

let convexClient: ConvexHttpClient | null = null;

function getConvexClient() {
  if (!CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }
  if (!convexClient) {
    convexClient = new ConvexHttpClient(CONVEX_URL);
  }
  return convexClient;
}

export interface PortfolioData {
  profile: PublicPortfolio;
  skills: PublicSkill[];
  projects: PublicProject[];
  experience: PublicExperience[];
}

export async function fetchPortfolioData(): Promise<PortfolioData> {
  const client = getConvexClient();
  const [profile, skills, projects, experience] = await Promise.all([
    client.query(api["portfolio/queries"].getProfile),
    client.query(api["portfolio/queries"].listPublicSkills, {}),
    client.query(api["portfolio/queries"].listPublicProjects),
    client.query(api["portfolio/queries"].listPublicExperience),
  ]);
  return { profile, skills, projects, experience };
}