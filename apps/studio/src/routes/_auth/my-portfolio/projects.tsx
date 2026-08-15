import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { ProjectsList } from "@/components/portfolio/projects/projects-list";

export const Route = createFileRoute("/_auth/my-portfolio/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const projects = useQuery(api.portfolio.queries.listMyProjects);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold mb-2">Projects</h2>
        <p className="text-muted-foreground">
          Manage your portfolio projects
        </p>
      </div>

      <ProjectsList projects={projects} />
    </div>
  );
}
