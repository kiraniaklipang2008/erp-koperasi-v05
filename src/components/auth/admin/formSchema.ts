
import { z } from "zod";
import { validatePassword } from "@/utils/security";

export const adminLoginFormSchema = z.object({
  username: z.string()
    .min(1, "Username is required")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(1, "Password is required")
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().refine((password) => {
    const validation = validatePassword(password);
    return validation.isValid;
  }, {
    message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
  }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
