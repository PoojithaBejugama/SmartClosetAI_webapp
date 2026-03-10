import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const uploadClothingSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  color: z.string().min(1, "Please select a color"),
  season: z.string().min(1, "Please select a season"),
  occasion: z.string().min(1, "Please select an occasion"),
  notes: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  preferred_style: z.string().optional(),
  preferred_colors: z.string().optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "New password must be at least 6 characters"),
});

export const outfitNameSchema = z.object({
  name: z.string().min(1, "Please name your outfit"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type UploadClothingFormData = z.infer<typeof uploadClothingSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
