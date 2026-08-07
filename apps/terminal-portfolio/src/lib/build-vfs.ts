import type { PublicPortfolio, PublicSkill, PublicProject, PublicExperience } from "@elcokiin/backend/lib/types/portfolio";
import type { DirectoryNode, FileNode } from "./vfs/schema";

function fileNode(
  name: string,
  content: string,
  extension?: string,
): FileNode {
  return {
    name,
    type: "file",
    permissions: "-rw-r--r--",
    content,
    extension,
  };
}

function dirNode(name: string, children: Record<string, DirectoryNode | FileNode> = {}): DirectoryNode {
  return {
    name,
    type: "directory",
    permissions: "drwxr-xr-x",
    children,
  };
}

function buildExperienceChildren(
  experience: PublicExperience[],
): Record<string, FileNode> {
  const education = experience.filter((e) => e.type === "education");
  const work = experience.filter((e) => e.type === "work");
  const certs = experience.filter((e) => e.type === "certification");

  const children: Record<string, FileNode> = {};

  if (education.length > 0) {
    const content = education
      .map((e) => {
        const dur = e.isCurrent ? "Present" : e.endDate ?? "Present";
        const range = e.startDate ? `${e.startDate} - ${dur}` : "";
        return `# ${e.title}\n${e.organization}${range ? `\n${range}` : ""}${e.description ? `\n\n${e.description}` : ""}`;
      })
      .join("\n\n---\n\n");
    children["academics.md"] = fileNode("academics.md", content, "md");
  }

  if (work.length > 0) {
    const content = work
      .map((e) => {
        const dur = e.isCurrent ? "Present" : e.endDate ?? "Present";
        const range = e.startDate ? `${e.startDate} - ${dur}` : "";
        return `# ${e.title}\n${e.organization}${range ? `\n${range}` : ""}${e.description ? `\n\n${e.description}` : ""}${e.skills?.length ? `\n\nSkills: ${e.skills.map((s) => s.name).join(", ")}` : ""}`;
      })
      .join("\n\n---\n\n");
    children["work.md"] = fileNode("work.md", content, "md");
  }

  if (certs.length > 0) {
    const content = certs
      .map((e) => {
        const lines = [`# ${e.title}`, e.organization];
        if (e.credentialUrl) lines.push(`Credential: ${e.credentialUrl}`);
        return lines.join("\n");
      })
      .join("\n\n---\n\n");
    children["certifications.md"] = fileNode("certifications.md", content, "md");
  }

  return children;
}

function buildProjectsChildren(
  projects: PublicProject[],
): Record<string, FileNode> {
  const children: Record<string, FileNode> = {};

  for (const project of projects) {
    const lines: string[] = [`# ${project.title}`];
    if (project.description) lines.push(project.description);
    if (project.philosophy) lines.push(`\n## Philosophy\n${project.philosophy}`);
    if (project.skills?.length) lines.push(`\nSkills: ${project.skills.map((s) => s.name).join(", ")}`);
    if (project.keyFeatures?.length) {
      lines.push("\n## Key Features");
      project.keyFeatures.forEach((f) => lines.push(`- ${f}`));
    }
    if (project.url) lines.push(`\nURL: ${project.url}`);
    if (project.githubUrl) lines.push(`GitHub: ${project.githubUrl}`);

    children[`${project.slug}.md`] = fileNode(`${project.slug}.md`, lines.join("\n"), "md");
  }

  return children;
}

function buildStackChildren(
  skills: PublicSkill[],
): Record<string, FileNode> {
  const grouped: Record<string, PublicSkill[]> = {};
  for (const skill of skills) {
    if (!grouped[skill.category]) grouped[skill.category] = [];
    grouped[skill.category]!.push(skill);
  }

  const children: Record<string, FileNode> = {};
  for (const [category, catSkills] of Object.entries(grouped)) {
    const data = catSkills.map((s) => ({
      name: s.name,
      icon: s.icon,
      level: s.level,
    }));
    children[`${category}.json`] = fileNode(
      `${category}.json`,
      JSON.stringify(data, null, 2),
      "json",
    );
  }

  return children;
}

export function buildVfs(
  profile: PublicPortfolio,
  skills: PublicSkill[],
  projects: PublicProject[],
  experience: PublicExperience[],
): DirectoryNode {
  const username = profile.name.split(" ")[0]?.toLowerCase() ?? "portfolio";

  return dirNode(username, {
    experience: dirNode("experience", buildExperienceChildren(experience)),
    projects: dirNode("projects", buildProjectsChildren(projects)),
    stack: dirNode("stack", buildStackChildren(skills)),
    "philosophy.md": fileNode(
      "philosophy.md",
      `# Philosophy\n\n${profile.philosophy ?? "No philosophy set."}`,
      "md",
    ),
  });
}