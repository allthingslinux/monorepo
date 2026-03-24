import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  banExpires: timestamp("ban_expires"), // Optional: The date when the user's ban will expire
  banReason: text("ban_reason"), // Optional: The reason for the user's ban
  banned: boolean("banned").default(false), // Optional: Indicates whether the user is banned
  createdAt: timestamp("created_at").defaultNow().notNull(),
  displayUsername: text("display_username").unique(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  role: text("role"), // Optional: The user's role (defaults to "user", admins have "admin" role)
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text("username").unique(),
});

export const session = pgTable(
  "session",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    impersonatedBy: text("impersonated_by"),
    ipAddress: text("ip_address"),
    token: text("token").notNull().unique(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // Optional: The ID of the admin that is impersonating this session
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    accountId: text("account_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    value: text("value").notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const passkey = pgTable(
  "passkey",
  {
    aaguid: text("aaguid"), // Optional: Authenticator's Attestation GUID indicating the type of the authenticator
    backedUp: boolean("backed_up").notNull(), // Whether the passkey is backed up
    counter: integer("counter").notNull(), // The counter of the passkey
    createdAt: timestamp("created_at"), // Optional: The time when the passkey was created
    credentialID: text("credential_id").notNull(), // The unique identifier of the registered credential
    deviceType: text("device_type").notNull(), // The type of device used to register the passkey
    id: text("id").primaryKey(), // Unique identifier for each passkey
    name: text("name"), // Optional: The name of the passkey
    publicKey: text("public_key").notNull(), // The public key of the passkey
    transports: text("transports"), // Optional: The transports used to register the passkey
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // The ID of the user
  },
  (table) => [
    index("passkey_userId_idx").on(table.userId),
    index("passkey_credentialID_idx").on(table.credentialID),
  ]
);

export const twoFactor = pgTable(
  "two_factor",
  {
    backupCodes: text("backup_codes"), // Optional: The backup codes for account recovery
    id: text("id").primaryKey(),
    secret: text("secret"), // Optional: The secret used to generate the TOTP code
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("twoFactor_secret_idx").on(table.secret),
    index("twoFactor_userId_idx").on(table.userId),
  ]
);