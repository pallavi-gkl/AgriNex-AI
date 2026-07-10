/**
 * Visual-only class replacements for AgriNex design system.
 * Does NOT touch logic — only Tailwind/CSS class strings.
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(".");

const DIRS = ["app", "components"];

const REPLACEMENTS = [
  [/bg-\[#f8faf8\]/g, "bg-transparent"],
  [/bg-white border border-slate-200 shadow-sm rounded-2xl/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white border border-slate-200 rounded-2xl/g, "premium-card rounded-3xl"],
  [/bg-white border border-slate-200 shadow-sm rounded-xl/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white border border-slate-200 rounded-xl/g, "premium-card rounded-3xl"],
  [/bg-white border border-slate-200 shadow-sm/g, "premium-card shadow-sm"],
  [/bg-white border border-slate-200/g, "premium-card"],
  [/bg-white rounded-2xl shadow-sm/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white rounded-2xl/g, "premium-card rounded-3xl"],
  [/bg-white rounded-xl shadow-sm/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white rounded-xl/g, "premium-card rounded-3xl"],
  [/bg-white shadow-sm rounded-2xl/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white shadow-lg rounded-2xl/g, "premium-card rounded-3xl shadow-lg"],
  [/className="bg-white /g, 'className="premium-card '],
  [/className=\{`([^`]*?)bg-white /g, 'className={`$1premium-card '],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, files);
    } else if (entry.name.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

let changed = 0;
for (const dir of DIRS) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) continue;
  for (const file of walk(fullDir)) {
    let content = fs.readFileSync(file, "utf8");
    const original = content;
    for (const [pattern, replacement] of REPLACEMENTS) {
      content = content.replace(pattern, replacement);
    }
    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      changed++;
      console.log("Updated:", path.relative(ROOT, file));
    }
  }
}
console.log(`\nDone. ${changed} files updated.`);
