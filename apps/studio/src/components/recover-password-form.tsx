import { forgetPasswordValidator } from "@elcokiin/backend/lib/validators/auth";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { useForm } from "@tanstack/react-form";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

type RecoverPasswordFormProps = {
  onBack: () => void;
};

export function RecoverPasswordForm({
  onBack,
}: RecoverPasswordFormProps): React.ReactNode {
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message || "Something went wrong");
        return;
      }

      setIsEmailSent(true);
      toast.success("If an account exists with that email, a reset link has been sent.");
    },
    validators: {
      onSubmit: forgetPasswordValidator,
    },
  });

  if (isEmailSent) {
    return (
      <div className="mx-auto w-full mt-10 max-w-md p-6">
        <h1 className="mb-4 text-center text-3xl font-bold">Check Your Email</h1>
        <p className="mb-6 text-center text-muted-foreground">
          If an account exists with that email address, we've sent a password
          reset link. Please check your inbox and spam folder.
        </p>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          The link will expire in 1 hour.
        </p>
        <Button variant="outline" className="w-full" onClick={onBack}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-2 text-center text-3xl font-bold">Recover Password</h1>
      <p className="mb-6 text-center text-muted-foreground">
        Enter your email address and we'll send you a link to reset your
        password.
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
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
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
              {state.isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Sign In
        </Button>
      </div>
    </div>
  );
}
