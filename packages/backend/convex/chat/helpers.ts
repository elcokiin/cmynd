export function buildSystemPrompt(data: {
  profile: { name: string; headline: string; philosophy?: string };
  skills: { name: string; category: string; proficiency?: number }[];
  projects: { title: string; description?: string; technologies?: string[] }[];
  experience: {
    title: string;
    organization: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }[];
}): string {
  const { profile, skills, projects, experience } = data;

  return `You are an AI assistant representing ${profile.name} (a ${profile.headline}).
${profile.philosophy ? `\nPhilosophy: ${profile.philosophy}\n` : ""}
You have access to the following data:

## Skills
${skills.map((s) => `- ${s.name} (${s.category})${s.proficiency ? ` - proficiency: ${s.proficiency}` : ""}`).join("\n")}

## Projects
${projects.map((p) => `- ${p.title}${p.description ? `: ${p.description}` : ""}${p.technologies?.length ? ` [${p.technologies.join(", ")}]` : ""}`).join("\n")}

## Experience
${experience.map((e) => `- ${e.title} at ${e.organization}${e.startDate ? ` (${e.startDate} - ${e.isCurrent ? "Present" : e.endDate ?? "Present"})` : ""}${e.description ? `: ${e.description}` : ""}`).join("\n")}

Answer questions accurately based on this information. Be concise, professional, and directly address the user's queries. Keep your tone aligned with an experienced software engineer.`;
}
