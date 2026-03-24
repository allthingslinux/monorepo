"use strict";

const RELEASE_HEADER_RE = /^chore\(release\):/i;

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  ignores: [
    (message) => {
      const header = message.split("\n")[0]?.trim() ?? "";
      return RELEASE_HEADER_RE.test(header) || header.includes("[skip ci]");
    },
  ],
  rules: {
    "type-enum": [
      2,
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
    "subject-case": [2, "never", ["start-case", "pascal-case", "upper-case"]],
    "body-max-length": [2, "always", 1000],
    "body-max-line-length": [2, "always", 200],
  },
};
