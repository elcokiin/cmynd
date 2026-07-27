import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { SkillsManager } from "@/components/portfolio/skills-manager";

export const Route = createFileRoute("/_auth/admin/portfolio/skills")({
  component: SkillsPage,
});

function SkillsPage() {
  const skills = useQuery(api.portfolio.queries.listAllSkills);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold mb-2">Skills</h2>
        <p className="text-muted-foreground">
          Manage your skills and proficiencies
        </p>
      </div>

      <SkillsManager skills={skills} />
    </div>
  );
}
