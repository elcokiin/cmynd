import { z } from "zod";

export const emailValidator = z.email("Invalid email address");

export const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const nameValidator = z
  .string()
  .min(3, "Name must be at least 3 characters");

export const signInValidator = z.object({
  email: emailValidator,
  password: passwordValidator,
});

export const signUpValidator = z.object({
  name: nameValidator,
  email: emailValidator,
  password: passwordValidator,
});

export const forgetPasswordValidator = z.object({
  email: emailValidator,
});

export const resetPasswordValidator = z
  .object({
    newPassword: passwordValidator,
    confirmPassword: passwordValidator,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInData = z.infer<typeof signInValidator>;
export type SignUpData = z.infer<typeof signUpValidator>;
export type ForgetPasswordData = z.infer<typeof forgetPasswordValidator>;
export type ResetPasswordData = z.infer<typeof resetPasswordValidator>;
