import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public");
const target = path.join(root, "docs");

for (const entry of readdirSync(target)) {
  if (entry === ".gitkeep") continue;
  rmSync(path.join(target, entry), { recursive: true, force: true });
}

mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

console.log("Synced public/ -> docs/ for GitHub Pages");
