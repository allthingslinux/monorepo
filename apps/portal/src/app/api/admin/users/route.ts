import { handleAPIError, requireAdminOrStaff } from "@atl/api/utils";
import { db } from "@atl/db/client";
import { user } from "@atl/db/schema/auth";
import { ircAccount } from "@atl/db/schema/irc";
import { mailcowAccount } from "@atl/db/schema/mailcow";
import { mediawikiAccount } from "@atl/db/schema/mediawiki";
import { xmppAccount } from "@atl/db/schema/xmpp";
import { UserSearchSchema } from "@atl/schemas/user";
import { and, desc, eq, ilike, ne, or } from "drizzle-orm";
import type { NextRequest } from "next/server";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const { role, banned, search, expand, limit, offset } =
      UserSearchSchema.parse(Object.fromEntries(searchParams));

    // Build where conditions
    const conditions: ReturnType<typeof eq | typeof or>[] = [];
    if (role) {
      conditions.push(eq(user.role, role));
    }
    if (banned !== undefined) {
      conditions.push(eq(user.banned, banned));
    }
    if (search) {
      const searchCondition = or(
        ilike(user.email, `%${search}%`),
        ilike(user.name, `%${search}%`),
        ilike(user.username, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    if (expand === "integrations") {
      const [rows, [{ count }]] = await Promise.all([
        db
          .select({
            banExpires: user.banExpires,
            banReason: user.banReason,
            banned: user.banned,
            createdAt: user.createdAt,
            email: user.email,
            emailVerified: user.emailVerified,
            id: user.id,
            image: user.image,
            ircNick: ircAccount.nick,
            ircStatus: ircAccount.status,
            mailcowEmail: mailcowAccount.email,
            mailcowStatus: mailcowAccount.status,
            mediawikiStatus: mediawikiAccount.status,
            mediawikiWikiUsername: mediawikiAccount.wikiUsername,
            name: user.name,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
            updatedAt: user.updatedAt,
            username: user.username,
            xmppJid: xmppAccount.jid,
            xmppStatus: xmppAccount.status,
            xmppUsername: xmppAccount.username,
          })
          .from(user)
          .leftJoin(
            ircAccount,
            and(
              eq(ircAccount.userId, user.id),
              ne(ircAccount.status, "deleted")
            )
          )
          .leftJoin(
            xmppAccount,
            and(
              eq(xmppAccount.userId, user.id),
              ne(xmppAccount.status, "deleted")
            )
          )
          .leftJoin(
            mailcowAccount,
            and(
              eq(mailcowAccount.userId, user.id),
              ne(mailcowAccount.status, "deleted")
            )
          )
          .leftJoin(
            mediawikiAccount,
            and(
              eq(mediawikiAccount.userId, user.id),
              ne(mediawikiAccount.status, "deleted")
            )
          )
          .where(whereClause)
          .orderBy(desc(user.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: db.$count(user, whereClause) })
          .from(user)
          .limit(1),
      ]);

      const users = rows.map((row) => ({
        banExpires: row.banExpires,
        banReason: row.banReason,
        banned: row.banned,
        createdAt: row.createdAt,
        email: row.email,
        emailVerified: row.emailVerified,
        id: row.id,
        image: row.image,
        ircAccount: row.ircNick
          ? { nick: row.ircNick, status: row.ircStatus }
          : null,
        mailcowAccount: row.mailcowEmail
          ? { email: row.mailcowEmail, status: row.mailcowStatus }
          : null,
        mediawikiAccount: row.mediawikiWikiUsername
          ? {
              status: row.mediawikiStatus,
              wikiUsername: row.mediawikiWikiUsername,
            }
          : null,
        name: row.name,
        role: row.role,
        twoFactorEnabled: row.twoFactorEnabled,
        updatedAt: row.updatedAt,
        username: row.username,
        xmppAccount: row.xmppJid
          ? {
              jid: row.xmppJid,
              status: row.xmppStatus,
              username: row.xmppUsername,
            }
          : null,
      }));

      return Response.json({
        pagination: {
          hasMore: offset + limit < count,
          limit,
          offset,
          total: count,
        },
        users,
      });
    }

    const [users, [{ count }]] = await Promise.all([
      db
        .select()
        .from(user)
        .where(whereClause)
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: db.$count(user, whereClause) })
        .from(user)
        .limit(1),
    ]);

    return Response.json({
      pagination: {
        hasMore: offset + limit < count,
        limit,
        offset,
        total: count,
      },
      users,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
