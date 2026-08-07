import type { ReactNode } from "react";

import { Field, FieldLabel, FieldDescription, FieldError } from "@elcokiin/ui/field";
import { cn } from "@elcokiin/ui/lib/utils";

export interface FieldErrorLike {
  message?: string;
}

export interface PortfolioFieldLike {
  state: {
    meta: {
      isTouched?: boolean;
      errors?: Array<FieldErrorLike | undefined>;
    };
  };
  form: {
    state: {
      isSubmitted?: boolean;
    };
  };
}

export function getPortfolioFieldState(field: PortfolioFieldLike) {
  const showErrors =
    field.state.meta.isTouched || field.form.state.isSubmitted;
  const errors = showErrors ? field.state.meta.errors : [];
  return {
    showErrors,
    errors,
    invalid: (errors?.length ?? 0) > 0,
  };
}

interface PortfolioFieldProps {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  description?: string;
  errors?: Array<FieldErrorLike | undefined>;
  showErrors?: boolean;
  className?: string;
  children: ReactNode;
}

export function PortfolioField({
  label,
  htmlFor,
  required,
  optional,
  description,
  errors,
  showErrors,
  className,
  children,
}: PortfolioFieldProps) {
  const invalid = showErrors && (errors?.length ?? 0) > 0;

  return (
    <Field data-invalid={invalid || undefined} className={cn("gap-2", className)}>
      <FieldLabel htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {optional && (
          <span className="font-normal text-muted-foreground">(optional)</span>
        )}
      </FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {invalid && <FieldError errors={errors} />}
    </Field>
  );
}
