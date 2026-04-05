#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { startServer } from "../server/server.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
  cc-company-dashboard

  Usage:
    cc-company-dashboard [options]

  Options:
    -p, --port <number>  Port number (default: 3939)
    -d, --dir <path>     Directory to search for .company/ (default: cwd)
    --no-open            Don't open browser automatically
    -h, --help           Show this help
    -v, --version        Show version
  `);
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf-8"));
  console.log(pkg.version);
  process.exit(0);
}

function getArg(flag1, flag2, defaultValue) {
  const idx = args.indexOf(flag1) !== -1 ? args.indexOf(flag1) : args.indexOf(flag2);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return defaultValue;
}

const port = parseInt(getArg("-p", "--port", "3939"), 10);
const baseDir = path.resolve(getArg("-d", "--dir", process.cwd()));
const noOpen = args.includes("--no-open");

// Find .company/ directory
function findCompanyDir(startDir, maxDepth = 5) {
  let dir = startDir;
  for (let i = 0; i < maxDepth; i++) {
    const candidate = path.join(dir, ".company");
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const companyDir = findCompanyDir(baseDir);

if (!companyDir) {
  console.error(`\n  .company/ folder not found.`);
  console.error(`  Run /company in Claude Code first to create your organization.\n`);
  console.error(`  Searched from: ${baseDir}\n`);
  process.exit(1);
}

startServer(companyDir, port);

if (!noOpen) {
  import("open").then((mod) => mod.default(`http://localhost:${port}`)).catch(() => {});
}
