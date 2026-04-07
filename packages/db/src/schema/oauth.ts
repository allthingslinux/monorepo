import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { session, user } from "./auth";

export const oauthClient = pgTable("oauth_client", {
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret"),
  clientSecretExpiresAt: timestamp("client_secret_expires_at"), // Optional: Expiration time for client secret
  contacts: text("contacts").array(),
  createdAt: timestamp("created_at"),
  disabled: boolean("disabled").default(false),
  enableEndSession: boolean("enable_end_session"),
  grantTypes: text("grant_types").array(),
  icon: text("icon"),
  id: text("id").primaryKey(),
  metadata: jsonb("metadata"),
  name: text("name"),
  policy: text("policy").array(), // Privacy Policy URLs (array)
  postLogoutRedirectUris: text("post_logout_redirect_uris").array(),
  public: boolean("public"),
  redirectUris: text("redirect_uris").array().notNull(),
  referenceId: text("reference_id"),
  resources: text("resources").array(), // Optional: Allowed resources for this client
  responseTypes: text("response_types").array(),
  scopes: text("scopes").array(),
  skipConsent: boolean("skip_consent"),
  softwareId: text("software_id"),
  softwareStatement: text("software_statement"),
  softwareVersion: text("software_version"),
  tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
  tos: text("tos").array(), // Terms of Service URLs (array)
  type: text("type"),
  updatedAt: timestamp("updated_at"),
  uri: text("uri"),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
});

export const oauthRefreshToken = pgTable("oauth_refresh_token", {
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at"),
  expiresAt: timestamp("expires_at"),
  id: text("id").primaryKey(),
  referenceId: text("reference_id"),
  revoked: timestamp("revoked"),
  scopes: text("scopes").array().notNull(),
  sessionId: text("session_id").references(() => session.id, {
    onDelete: "set null",
  }),
  token: text("token").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const oauthAccessToken = pgTable("oauth_access_token", {
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at"),
  expiresAt: timestamp("expires_at"),
  id: text("id").primaryKey(),
  referenceId: text("reference_id"),
  refreshId: text("refresh_id").references(() => oauthRefreshToken.id, {
    onDelete: "cascade",
  }),
  scopes: text("scopes").array().notNull(),
  sessionId: text("session_id").references(() => session.id, {
    onDelete: "set null",
  }),
  token: text("token").unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
});

export const oauthConsent = pgTable("oauth_consent", {
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at"),
  id: text("id").primaryKey(),
  referenceId: text("reference_id"),
  scopes: text("scopes").notNull(), // Comma-separated list of scopes (not array)
  updatedAt: timestamp("updated_at"),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
});
