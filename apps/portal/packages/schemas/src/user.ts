import { user } from "@portal/db/schema/auth";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

/**
 * Base User Schema from Database
 */
export const selectUserSchema = createSelectSchema(user);

/**
 * Client-facing User DTO Schema
 * Only exposes public/safe fields
 */
export const UserDtoSchema = selectUserSchema.pick({
  banExpires: true,
  banReason: true,
  banned: true,
  createdAt: true,
  email: true,
  emailVerified: true,
  id: true,
  image: true,
  name: true,
  role: true,
  username: true,
});

export type UserDto = z.infer<typeof UserDtoSchema>;

/**
 * Schema for updating user profile (self-service)
 */
export const UpdateUserSelfSchema = z.object({
  image: z.string().url("Invalid image URL").optional(),
  name: z.string().trim().min(1, "Name is required").max(100).optional(),
});

/**
 * Schema for updating user data (admin/staff)
 */
export const AdminUpdateUserSchema = z.object({
  banExpires: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((date) => !(date && Number.isNaN(date.getTime())), {
      message: "Invalid date",
    })
    .optional(),
  banReason: z.string().trim().max(500).optional(),
  banned: z.boolean().optional(),
  email: z.string().email("Invalid email address").optional(),
  name: z.string().trim().min(1, "Name is required").max(100).optional(),
  role: z.enum(["user", "admin", "staff"]).optional(),
});

/**
 * Schema for user searching/filtering query params
 */
export const UserSearchSchema = z.object({
  banned: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  expand: z
    .string()
    .optional()
    .transform((val) => (val === "integrations" ? "integrations" : undefined)),
  limit: z.coerce.number().int().positive().default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
  role: z.string().optional(),
  search: z.string().optional(),
});