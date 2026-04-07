import { and, eq, ne } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { env } from "@/env";
import { APIError, handleAPIError, requireAuth } from "@atl/api/utils";
import { db } from "@atl/db/client";
import { account, user } from "@atl/db/schema/auth";
import { ircAccount } from "@atl/db/schema/irc";
import { xmppAccount } from "@atl/db/schema/xmpp";

// With cacheComponents, route handlers are dynamic by default.

/**
 * GET /api/bridge/identity
 *
 * Cross-protocol identity lookup for the bridge service.
 * Accepts either:
 *   - A service token via BRIDGE_SERVICE_TOKEN env var (for bridge ↔ portal)
 *   - A valid user session (Bearer token via better-auth)
 *
 * Query params (exactly one required):
 *   - discordId: look up by Discord snowflake
 *   - ircNick:   look up by IRC nick
 *   - xmppJid:   look up by XMPP JID
 *
 * Response body (HTTP 200):
 *   { ok: true, identity: { user_id, username, discord_id, irc_nick, irc_status,
 *                            xmpp_jid, xmpp_username, xmpp_status,
 *                            avatar_url } }
 *
 * Note: irc_server is intentionally omitted — single-server deployment (irc.atl.chat).
 *
 * Returns 404 when no matching account is found.
 * Returns 400 when no valid query param is provided.
 */

/**
 * Authenticate via BRIDGE_SERVICE_TOKEN when configured,
 * otherwise fall back to better-auth session.
 */
async function requireBridgeAuth(request: NextRequest): Promise<void> {
  const serviceToken = env.BRIDGE_SERVICE_TOKEN;
  if (serviceToken) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${serviceToken}`) {
      return; // Service token matched
    }
    throw new APIError("Unauthorized bridge request", 401);
  }
  // Fall back to better-auth session (user sessions still work)
  await requireAuth(request);
}

async function fetchIrcForUser(userId: string) {
  const [irc] = await db
    .select({ nick: ircAccount.nick, status: ircAccount.status })
    .from(ircAccount)
    .where(and(eq(ircAccount.userId, userId), ne(ircAccount.status, "deleted")))
    .limit(1);
  return irc ?? null;
}

async function fetchXmppForUser(userId: string) {
  const [xmpp] = await db
    .select({
      jid: xmppAccount.jid,
      status: xmppAccount.status,
      username: xmppAccount.username,
    })
    .from(xmppAccount)
    .where(
      and(eq(xmppAccount.userId, userId), ne(xmppAccount.status, "deleted"))
    )
    .limit(1);
  return xmpp ?? null;
}

async function fetchDiscordForUser(userId: string) {
  const [discord] = await db
    .select({ accountId: account.accountId })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "discord")))
    .limit(1);
  return discord ?? null;
}

async function fetchUserProfile(userId: string) {
  const [row] = await db
    .select({ image: user.image, username: user.username })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return {
    avatarUrl: row?.image ?? null,
    username: row?.username ?? null,
  };
}

async function lookupByDiscordId(discordId: string) {
  const [discordAccount] = await db
    .select({ userId: account.userId })
    .from(account)
    .where(
      and(eq(account.providerId, "discord"), eq(account.accountId, discordId))
    )
    .limit(1);

  if (!discordAccount) {
    return Response.json(
      { error: "Discord account not linked", ok: false },
      { status: 404 }
    );
  }

  const { userId } = discordAccount;
  const [irc, xmpp, profile] = await Promise.all([
    fetchIrcForUser(userId),
    fetchXmppForUser(userId),
    fetchUserProfile(userId),
  ]);

  return Response.json({
    identity: {
      avatar_url: profile.avatarUrl ?? null,
      discord_id: discordId,
      irc_nick: irc?.nick ?? null,
      irc_status: irc?.status ?? null,
      user_id: userId,
      username: profile.username,
      xmpp_jid: xmpp?.jid ?? null,
      xmpp_status: xmpp?.status ?? null,
      xmpp_username: xmpp?.username ?? null,
    },
    ok: true,
  });
}

async function lookupByIrcNick(ircNick: string) {
  const [active] = await db
    .select()
    .from(ircAccount)
    .where(and(eq(ircAccount.nick, ircNick), ne(ircAccount.status, "deleted")))
    .limit(1);

  if (!active) {
    return Response.json(
      { error: "IRC account not found", ok: false },
      { status: 404 }
    );
  }

  const [xmpp, discordAcc, profile] = await Promise.all([
    fetchXmppForUser(active.userId),
    fetchDiscordForUser(active.userId),
    fetchUserProfile(active.userId),
  ]);

  return Response.json({
    identity: {
      avatar_url: profile.avatarUrl ?? null,
      discord_id: discordAcc?.accountId ?? null,
      irc_nick: active.nick,
      irc_status: active.status,
      user_id: active.userId,
      username: profile.username,
      xmpp_jid: xmpp?.jid ?? null,
      xmpp_status: xmpp?.status ?? null,
      xmpp_username: xmpp?.username ?? null,
    },
    ok: true,
  });
}

async function lookupByXmppJid(xmppJid: string) {
  const [xmpp] = await db
    .select()
    .from(xmppAccount)
    .where(and(eq(xmppAccount.jid, xmppJid), ne(xmppAccount.status, "deleted")))
    .limit(1);

  if (!xmpp) {
    return Response.json(
      { error: "XMPP account not found", ok: false },
      { status: 404 }
    );
  }

  const [irc, discordAcc, profile] = await Promise.all([
    fetchIrcForUser(xmpp.userId),
    fetchDiscordForUser(xmpp.userId),
    fetchUserProfile(xmpp.userId),
  ]);

  return Response.json({
    identity: {
      avatar_url: profile.avatarUrl ?? null,
      discord_id: discordAcc?.accountId ?? null,
      irc_nick: irc?.nick ?? null,
      irc_status: irc?.status ?? null,
      user_id: xmpp.userId,
      username: profile.username,
      xmpp_jid: xmpp.jid,
      xmpp_status: xmpp.status,
      xmpp_username: xmpp.username,
    },
    ok: true,
  });
}

export async function GET(request: NextRequest) {
  try {
    await requireBridgeAuth(request);

    const { searchParams } = new URL(request.url);

    const discordId = searchParams.get("discordId");
    const ircNick = searchParams.get("ircNick");
    const xmppJid = searchParams.get("xmppJid");

    if (!(discordId || ircNick || xmppJid)) {
      throw new APIError("Provide one of: discordId, ircNick, xmppJid", 400);
    }

    if (discordId) {
      return lookupByDiscordId(discordId);
    }
    if (ircNick) {
      return lookupByIrcNick(ircNick);
    }

    return lookupByXmppJid(xmppJid ?? "");
  } catch (error) {
    return handleAPIError(error);
  }
}
