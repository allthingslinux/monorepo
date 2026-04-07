/**
 * scripts/sync-refs.mjs
 * Automates TypeScript Project References for the allthingslinux monorepo.
 *
 * 1. Reads all workspace packages.
 * 2. Parses their dependencies to find workspace inter-dependencies.
 * 3. Updates their tsconfig.json to include `references` mapping to those projects.
 * 4. Ensures they extend the correct `@atl/tsconfig` base.
 */
import { readFileSync, writeFileSync, readdirSync, lstatSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const root = process.cwd();

/**
 * @typedef {{ name?: string, dependencies?: Record<string,string>, devDependencies?: Record<string,string>, peerDependencies?: Record<string,string> }} PackageJson
 * @typedef {{ extends?: string, compilerOptions?: Record<string,unknown>, include?: string[], exclude?: string[], references?: {path:string}[] }} TsConfig
 */

/**
 * @param {string} dir - Directory to search
 * @param {string[]} results - Accumulator for found package directories
 * @returns {string[]} All found package directories
 */
function findPackages(dir, results = []) {
  const skip = new Set([
    "node_modules",
    ".next",
    ".turbo",
    ".git",
    "references",
    ".venv",
    "upstream",
    "dist",
  ]);
  /** @type {string[]} */
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (skip.has(entry)) {
      continue;
    }
    const full = join(dir, entry);
    try {
      const stat = lstatSync(full);
      if (stat.isSymbolicLink()) {continue;}
      if (stat.isDirectory()) {
        findPackages(full, results);
      } else if (entry === "package.json") {
        const rel = relative(root, full);
        if (rel.startsWith("apps/") || rel.startsWith("packages/")) {
          results.push(dirname(full));
        }
      }
    } catch {
      continue;
    }
  }
  return results;
}

const packageDirs = findPackages(root);

/** @type {Record<string, string>} */
const workspaceMap = {};
for (const dir of packageDirs) {
  try {
    /** @type {PackageJson} */
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
    if (pkg.name) {
      workspaceMap[pkg.name] = dir;
    }
  } catch {
    /* ignore */
  }
}

const workspaceNames = new Set(Object.keys(workspaceMap));
console.log(`Found ${workspaceNames.size} workspace packages.`);

let updatedCount = 0;

for (const dir of packageDirs) {
  const isApp = relative(root, dir).startsWith("apps/");

  /** @type {PackageJson} */
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
  } catch {
    continue;
  }

  const deps = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ]);

  const referencedPackages = [...deps].filter(
    (d) => workspaceNames.has(d) && d !== pkg.name && d !== "@atl/tsconfig"
  );

  if (pkg.name !== "@atl/tsconfig") {
    pkg.devDependencies ??= {};
    let updated = false;
    if (!pkg.devDependencies["@atl/tsconfig"]) {
      pkg.devDependencies["@atl/tsconfig"] = "workspace:*";
      updated = true;
    }
    if (!pkg.devDependencies["@types/node"]) {
      pkg.devDependencies["@types/node"] = "catalog:";
      updated = true;
    }
    if (updated) {
      writeFileSync(
        join(dir, "package.json"),
        `${JSON.stringify(pkg, null, 2)}\n`,
        "utf-8"
      );
    }
  }

  const tsconfigPath = join(dir, "tsconfig.json");
  /** @type {TsConfig} */
  let tsconfig;
  try {
    tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
  } catch {
    if (dir.endsWith("tsconfig")) {continue;}
    tsconfig = {};
  }

  if (pkg.name !== "@atl/tsconfig") {
    tsconfig.extends = `@atl/tsconfig/${isApp ? "nextjs.json" : "library.json"}`;
  }

  if (isApp && !tsconfig.include) {
    tsconfig.include = [
      "next-env.d.ts",
      "**/*.ts",
      "**/*.tsx",
      "**/*.mts",
      ".next/types/**/*.ts",
      ".next/dev/types/**/*.ts",
    ];
    tsconfig.exclude = ["node_modules/**"];
  }

  if (tsconfig.compilerOptions) {
    const inherited = [
      "target",
      "lib",
      "module",
      "moduleResolution",
      "resolveJsonModule",
      "isolatedModules",
      "strict",
      "forceConsistentCasingInFileNames",
      "noFallthroughCasesInSwitch",
      "skipLibCheck",
      "esModuleInterop",
      "noEmit",
      "incremental",
      "plugins",
      "allowJs",
      "jsx",
      "composite",
      "declaration",
      "declarationMap",
      "emitDeclarationOnly",
      "noUncheckedSideEffectImports",
    ];
    for (const key of inherited) {
      if (Object.hasOwn(tsconfig.compilerOptions, key)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete tsconfig.compilerOptions[key];
      }
    }
  }

  tsconfig.compilerOptions ??= {};

  if (!isApp) {
    tsconfig.compilerOptions["outDir"] = "dist";
  }

  if (Object.keys(tsconfig.compilerOptions).length === 0) {
    delete tsconfig.compilerOptions;
  }

  if (referencedPackages.length > 0) {
    const references = referencedPackages.map((refName) => ({
      path: relative(dir, workspaceMap[refName]),
    }));
    references.sort((a, b) => a.path.localeCompare(b.path));
    tsconfig.references = references;
  } else {
    delete tsconfig.references;
  }

  const newContent = `${JSON.stringify(tsconfig, null, 2)}\n`;
  let oldContent = "";
  try {
    oldContent = readFileSync(tsconfigPath, "utf-8");
  } catch {
    /* noop */
  }

  if (newContent !== oldContent) {
    writeFileSync(tsconfigPath, newContent, "utf-8");
    const displayDir = relative(root, dir);
    console.log(`[UPDATED] ${displayDir}/tsconfig.json`);
    updatedCount += 1;
  }
}

console.log(`\n✅ Synced ${updatedCount} tsconfig.json file(s).`);
