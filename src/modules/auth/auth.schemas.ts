import { z } from "zod";

export const userId = z.uuid();

export const reqEmail = z.email();

export type UserId = z.infer<typeof userId>;
export type ReqEmail = z.infer<typeof reqEmail>;

const fullName = z
  .string()
  .trim()
  .min(5, "Full Name cannot lee than 5 characters.")
  .max(200, "Full Name cannot exceed 200 characters");
const email = z
  .email("Please enter a valid email.")
  .trim()
  .toLowerCase()
  .max(200, "Email cannot exceed 200 characters");

export const registerUserSchema = z.object({
  fullName,
  email,
  password: z
    .string()
    .trim()
    .min(5, "Password cannot less than 5 characters")
    .max(200, "Password cannot exceed 200 characters"),
});

export const updateUserSchema = z.object({
  fullName,
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid emaill address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
