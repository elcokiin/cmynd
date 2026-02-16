import { z } from "zod";

import { resetPasswordValidator } from "@elcokiin/backend/lib/validators/auth";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircleIcon, ArrowLeftIcon, CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

const searchSchema = z.object({
  token: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => searchSchema.parse(search),
  component: ResetPasswordPage,
});

function ResetPasswordPage(): React.ReactNode {
  const { token, error: urlError } = Route.useSearch();
  const [isResetComplete, setIsResetComplete] = useState(false);

  if (urlError === "INVALID_TOKEN" || (!token && !isResetComplete)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="mx-auto w-full max-w-md p-6 text-center">
          <AlertCircleIcon className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="mb-2 text-2xl font-bold">Invalid or Expired Link</h1>
          <p className="mb-6 text-muted-foreground">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Button variant="outline" render={<Link to="/" />}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isResetComplete) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="mx-auto w-full max-w-md p-6 text-center">
          <CheckCircleIcon className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold">Password Reset Complete</h1>
          <p className="mb-6 text-muted-foreground">
            Your password has been reset successfully. You can now sign in with
            your new password.
          </p>
          <Button render={<Link to="/" />}> Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <ResetPasswordForm
      token={token!}
      onComplete={() => setIsResetComplete(true)}
    />
  );
}

type ResetPasswordFormProps = {
  token: string;
  onComplete: () => void;
};

function ResetPasswordForm({
  token,
  onComplete,
}: ResetPasswordFormProps): React.ReactNode {
  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.resetPassword({
        newPassword: value.newPassword,
        token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
        return;
      }

      toast.success("Password reset successfully!");
      onComplete();
    },
    validators: {
      onSubmit: resetPasswordValidator,
    },
  });

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md p-6">
        <h1 className="mb-2 text-center text-3xl font-bold">
          Reset Your Password
        </h1>
        <p className="mb-6 text-center text-muted-foreground">
          Enter your new password below.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <form.Field name="newPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>New Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <div>
            <form.Field name="confirmPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirm Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <form.Subscribe>
            {(state) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!state.canSubmit || state.isSubmitting}
              >
                {state.isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            render={<Link to="/" />}
            className="text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
