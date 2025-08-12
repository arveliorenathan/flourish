import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z
      .string()
      .email("Invalid email address")
      .refine((val) => val.endsWith("@gmail.com"), {
        message: "Email must be a gmail.com address",
      }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email("Inalid email address")
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Email must be a gmail.com address",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
