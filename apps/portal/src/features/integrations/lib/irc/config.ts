import "server-only";
import { keys } from "./keys";

const env = keys();

export const ircConfig = {
  atheme: {
    insecureSkipVerify: env.IRC_ATHEME_INSECURE_SKIP_VERIFY ?? false,
    jsonrpcUrl: env.IRC_ATHEME_JSONRPC_URL,
    operAccount: env.IRC_ATHEME_OPER_ACCOUNT,
    operPassword: env.IRC_ATHEME_OPER_PASSWORD,
  },
  port: env.IRC_PORT ?? 6697,
  server: env.IRC_SERVER ?? "irc.atl.chat",
  unreal: {
    insecureSkipVerify: env.IRC_UNREAL_INSECURE_SKIP_VERIFY ?? false,
    jsonrpcUrl: env.IRC_UNREAL_JSONRPC_URL,
    rpcPassword: env.IRC_UNREAL_RPC_PASSWORD,
    rpcUser: env.IRC_UNREAL_RPC_USER,
  },
} as const;

/**
 * Whether IRC (Atheme) provisioning is configured.
 */
export function isIrcConfigured(): boolean {
  return !!ircConfig.atheme.jsonrpcUrl;
}

/**
 * Whether UnrealIRCd JSON-RPC (admin) is configured.
 */
export function isUnrealConfigured(): boolean {
  return !!(
    ircConfig.unreal.jsonrpcUrl &&
    ircConfig.unreal.rpcUser &&
    ircConfig.unreal.rpcPassword
  );
}

/**
 * Whether Atheme oper credentials are configured (needed for FDROP).
 */
export function isAthemeOperConfigured(): boolean {
  return !!(ircConfig.atheme.operAccount && ircConfig.atheme.operPassword);
}
