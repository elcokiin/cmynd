import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { ExperienceList } from "@/components/portfolio/experience-list";

export const Route = createFileRoute("/_auth/admin/portfolio/experience")({
  component: ExperiencePage,
});

function ExperiencePage() {
  const experience = useQuery(api.portfolio.queries.listAllExperience);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Experience</h2>
        <p className="text-muted-foreground">
          Manage your work, education, and certifications
        </p>
      </div>

      <ExperienceList experience={experience} />
    </div>
  );
}
