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
        // Apps & packages
        "web",
        "portal",
        "chat",
        "bridge",
        "bridge/irc",
        "bridge/xmpp",
        "bridge/discord",
        "tools",
        "docs",
        "ui",
        "fibery",
        // Infrastructure & ops
        "infra",
        "pubnix",
        // Tooling & repo-wide
        "deps",
        "scripts",
        "tests",
        "config",
        "ci",
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
