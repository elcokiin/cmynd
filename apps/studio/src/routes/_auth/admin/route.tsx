import { Button } from "@elcokiin/ui/button";
import { ErrorCode } from "@elcokiin/errors/codes";
import { getUserFriendlyMessage, parseError } from "@elcokiin/errors/utils";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

export const Route = createFileRoute("/_auth/admin")({
  component: AdminLayout,
  errorComponent: AdminErrorBoundary,
});

function AdminLayout() {
  return <Outlet />;
}

function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const navigate = useNavigate();
  const parsed = parseError(error);

  const isAccessDenied =
    parsed.code === ErrorCode.ADMIN_REQUIRED ||
    parsed.code === ErrorCode.UNAUTHENTICATED ||
    parsed.code === ErrorCode.UNAUTHORIZED;

  const title = isAccessDenied ? "Access Denied" : "Something went wrong";
  const message = getUserFriendlyMessage(error);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground max-w-md text-center">{message}</p>
      <div className="flex gap-2">
        <Button onClick={() => navigate({ to: "/" })} variant="outline">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Go to Home
        </Button>
        {!isAccessDenied && <Button onClick={reset}>Try Again</Button>}
      </div>
    </div>
  );
}
