import { Button } from "@elcokiin/ui/button";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { SidebarProvider } from "@elcokiin/ui/sidebar";

import { Layout } from "@/components/layout/layout";
import { RecoverPasswordForm } from "@/components/recover-password-form";
import { SignInForm } from "@/components/sign-in-form";
import { SignUpForm } from "@/components/sign-up-form";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  errorComponent: AuthErrorComponent,
});

type AuthView = "sign-in" | "sign-up" | "recover-password";

function AuthLayout() {
  const [authView, setAuthView] = useState<AuthView>("sign-in");

  const authViews: Record<AuthView, React.ReactNode> = {
    "sign-in": (
      <SignInForm
        onSwitchToSignUp={() => setAuthView("sign-up")}
        onSwitchToRecover={() => setAuthView("recover-password")}
      />
    ),
    "sign-up": <SignUpForm onSwitchToSignIn={() => setAuthView("sign-in")} />,
    "recover-password": (
      <RecoverPasswordForm onBack={() => setAuthView("sign-in")} />
    ),
  };

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
        <div className="flex items-center justify-center h-full">
          {authViews[authView]}
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <div className="inline-block animate-spin">
              <RefreshCwIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading...</p>
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
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4 max-w-md p-6">
        <h1 className="text-2xl font-bold text-destructive">
          Authentication Error
        </h1>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={reset} variant="outline">
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
