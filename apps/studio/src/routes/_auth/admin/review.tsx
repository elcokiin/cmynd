import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/admin/review")({
  beforeLoad: () => {
    throw redirect({
      to: "/admin",
    });
  },
  component: () => null,
});
