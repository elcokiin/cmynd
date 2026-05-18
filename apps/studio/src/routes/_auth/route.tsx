import { Button } from "@elcokiin/ui/button";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { RefreshCwIcon } from "lucide-react";
import { SidebarProvider } from "@elcokiin/ui/sidebar";

import { Layout } from "@/components/layout/layout";
import { SignInForm } from "@/components/sign-in-form";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  errorComponent: AuthErrorComponent,
});

function AuthLayout() {
  return (
    <>
      <Authenticated>
        <SidebarProvider open={false}>
          <Layout>
            <Outlet />
          </Layout>
        </SidebarProvider>
      </Authenticated>
      <Unauthenticated>
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground">
          <div className="relative z-10 w-full h-full flex flex-col">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
          <div className="text-center space-y-4">
            <div className="inline-block animate-spin">
              <RefreshCwIcon className="h-8 w-8 text-primary" />
            </div>
            <p className="text-primary">Loading...</p>
          </div>
        </div>
      </AuthLoading>
    </>
  );
}

function AuthErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center space-y-4 max-w-md p-6">
        <h1 className="text-2xl font-bold text-destructive">Application Error</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={reset} variant="outline" className="text-foreground">
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
