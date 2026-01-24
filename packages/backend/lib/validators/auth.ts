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

export type SignInData = z.infer<typeof signInValidator>;
export type SignUpData = z.infer<typeof signUpValidator>;
