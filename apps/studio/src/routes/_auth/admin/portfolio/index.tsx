import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { ProfileForm } from "@/components/portfolio/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";

export const Route = createFileRoute("/_auth/admin/portfolio/")({
  component: ProfilePage,
});

function ProfilePage() {
  const portfolio = useQuery(api.portfolio.queries.getPortfolioForEdit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Profile</h2>
        <p className="text-muted-foreground">
          Manage your public portfolio profile
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio === undefined ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          ) : (
            <ProfileForm portfolio={portfolio} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
