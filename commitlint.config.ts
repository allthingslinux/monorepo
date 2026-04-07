import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const RELEASE_HEADER_RE = /^chore\(release\):/i;

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  // semantic-release/@semantic-release/git: release commits can include a long changelog in the body
  ignores: [
    (message: string) => {
      const header = message.split("\n")[0]?.trim() ?? "";
      return RELEASE_HEADER_RE.test(header) || header.includes("[skip ci]");
    },
  ],
  rules: {
    "body-max-length": [RuleConfigSeverity.Error, "always", 1000],
    "body-max-line-length": [RuleConfigSeverity.Error, "always", 200],
    "scope-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        // Apps
        "web",
        "portal",
        "portal/auth",
        "portal/db",
        "portal/api",
        "portal/admin",
        "portal/email",
        "portal/seo",
        "portal/i18n",
        "chat-web",
        "docs",
        "bridge",
        "bridge/irc",
        "bridge/xmpp",
        "bridge/discord",
        "tools-web",
        // Packages
        "ui",
        "discord",
        "fibery",
        "tools-manifest",
        // Services
        "chat",
        "chat/irc",
        "chat/xmpp",
        "tools",
        "network",
        "network/dns",
        "network/turn",
        "network/uptime",
        "network/sftp",
        "observability",
        "observability/grafana",
        "observability/loki",
        "observability/alloy",
        // Infrastructure & ops
        "infra",
        "infra/chat",
        "infra/network",
        "infra/observability",
        "infra/tools",
        "nginx",
        "docker",
        "pubnix",
        "pubnix/ansible",
        "pubnix/terraform",
        "pubnix/skel",
        // Org & governance
        "org",
        "org/brand",
        "org/governance",
        "org/policies",
        "org/security",
        "security",
        // Tooling & repo-wide
        "deps",
        "scripts",
        "tests",
        "config",
        "lint",
        "ci",
        "release",
        "agents",
      ],
    ],
    "subject-case": [
      RuleConfigSeverity.Error,
      "never",
      ["start-case", "pascal-case", "upper-case"],
    ],
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
  },
};

export default config;
