// ============================================================================
// MediaWiki Integration Schemas
// ============================================================================
// Zod schemas for MediaWiki integration API validation

import { selectMediawikiAccountSchema } from "@portal/db/schema/mediawiki";
import { z } from "zod";

import { brandedString, metadataSchema } from "../utils";
import { isValidWikiUsername, WIKI_USERNAME_MAX_LENGTH } from "./validation";

// Status enums matching database
export const MediaWikiAccountStatusSchema = z.enum([
  "active",
  "suspended",
  "deleted",
]);

export const UpdateMediaWikiAccountStatusSchema = z.enum([
  "active",
  "suspended",
]);

/**
 * Wiki username validation schema
 */
export const WikiUsernameSchema = brandedString<"WikiUsername">(
  z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(
      WIKI_USERNAME_MAX_LENGTH,
      `Username must be ${WIKI_USERNAME_MAX_LENGTH} characters or less`
    )
    .refine(
      isValidWikiUsername,
      `Invalid username. Use letters, digits, spaces, hyphens, or underscores (max ${WIKI_USERNAME_MAX_LENGTH} characters).`
    )
);

/**
 * Schema for creating a MediaWiki account via API
 */
export const CreateMediaWikiAccountRequestSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  wikiUsername: WikiUsernameSchema,
});

/**
 * Schema for updating a MediaWiki account via API
 * Derives from create schema to reuse validation, then extends with update-specific fields
 */
export const UpdateMediaWikiAccountRequestSchema =
  CreateMediaWikiAccountRequestSchema.partial().extend({
    metadata: metadataSchema,
    status: UpdateMediaWikiAccountStatusSchema.optional(),
  });

/**
 * Full MediaWiki account schema (for responses)
 * Extends database select schema with proper metadata typing and integration ID
 */
export const MediaWikiAccountSchema = selectMediawikiAccountSchema.extend({
  integrationId: z.literal("mediawiki"),
  metadata: metadataSchema,
  temporaryPassword: z.string().optional(),
});

// Type exports
export type MediaWikiAccountStatus = z.infer<
  typeof MediaWikiAccountStatusSchema
>;
export type UpdateMediaWikiAccountStatus = z.infer<
  typeof UpdateMediaWikiAccountStatusSchema
>;
export type CreateMediaWikiAccountRequest = z.infer<
  typeof CreateMediaWikiAccountRequestSchema
>;
export type UpdateMediaWikiAccountRequest = z.infer<
  typeof UpdateMediaWikiAccountRequestSchema
>;
export type MediaWikiAccount = z.infer<typeof MediaWikiAccountSchema>;
