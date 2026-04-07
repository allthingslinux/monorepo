import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { handleAPIError, requireAuth } from "@atl/api/utils";
import { db } from "@atl/db/client";
import { user } from "@atl/db/schema/auth";
import {
  enrichWideEventWithUser,
  withWideEvent,
} from "@atl/observability/wide-events";
import type { WideEvent } from "@atl/observability/wide-events";
import { UpdateUserSelfSchema } from "@atl/schemas/user";

// With cacheComponents, route handlers are dynamic by default.

/**
 * GET /api/user/me
 * Get current authenticated user's profile
 *
 * Uses wide events pattern: single context-rich log entry per request
 */
export const GET = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    try {
      const { userId, session } = await requireAuth(request);

      // Enrich event with user context (high cardinality field)
      enrichWideEventWithUser(event, {
        email: session.user.email,
        id: userId,
      });

      // DTO: Only return necessary fields, not entire user object
      // This prevents exposing sensitive data like internal IDs, timestamps, etc.
      const [userData] = await db
        .select({
          createdAt: user.createdAt,
          email: user.email,
          emailVerified: user.emailVerified,
          id: user.id,
          image: user.image,
          name: user.name,
          role: user.role,
          username: user.username,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userData) {
        // Enrich event with business context about the failure
        event.user_not_found = true;
        return Response.json(
          { error: "User not found", ok: false },
          { status: 404 }
        );
      }

      // Enrich event with business context
      event.user_found = true;
      event.email_verified = userData.emailVerified;
      if (userData.role) {
        event.user_role = userData.role;
      }

      return Response.json({ user: userData });
    } catch (error) {
      return handleAPIError(error);
    }
  }
);

/**
 * PATCH /api/user/me
 * Update current authenticated user's profile
 *
 * Uses wide events pattern: single context-rich log entry per request
 */
export const PATCH = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    try {
      const { userId, session } = await requireAuth(request);
      const body = UpdateUserSelfSchema.parse(await request.json());

      // Enrich event with user context
      enrichWideEventWithUser(event, {
        email: session.user.email,
        id: userId,
      });

      // Enrich event with request context
      event.update_fields = Object.keys(body);

      // Only allow updating specific fields (name, email verification handled by Better Auth)
      const [updated] = await db
        .update(user)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
        .returning({
          // DTO: Only return necessary fields in response
          createdAt: user.createdAt,
          email: user.email,
          emailVerified: user.emailVerified,
          id: user.id,
          image: user.image,
          name: user.name,
          role: user.role,
          username: user.username,
        });

      if (!updated) {
        event.user_not_found = true;
        return Response.json(
          { error: "User not found", ok: false },
          { status: 404 }
        );
      }

      // Enrich event with business context
      event.update_successful = true;
      event.name_updated = body.name !== undefined;
      if (updated.role) {
        event.user_role = updated.role;
      }

      return Response.json({ user: updated });
    } catch (error) {
      return handleAPIError(error);
    }
  }
);
