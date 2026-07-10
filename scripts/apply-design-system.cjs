/**
 * Visual-only class replacements for AgriNex design system.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIRS = ["app", "components"];

const REPLACEMENTS = [
  [/bg-\[#f8faf8\]/g, "bg-transparent"],
  [/bg-white border-slate-200\/80 rounded-2xl/g, "premium-card rounded-3xl border-slate-200/50"],
  [/bg-white shadow-sm p-4 rounded-2xl/g, "premium-card shadow-sm p-4 rounded-3xl"],
  [/bg-white shadow-sm p-5 rounded-2xl/g, "premium-card shadow-sm p-5 rounded-3xl"],
  [/bg-white shadow-sm p-6 rounded-2xl/g, "premium-card shadow-sm p-6 rounded-3xl"],
  [/lg:col-span-2 bg-white shadow-sm p-5 rounded-2xl/g, "lg:col-span-2 premium-card shadow-sm p-5 rounded-3xl"],
  [/bg-white border border-slate-200 shadow-sm rounded-2xl/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white border border-slate-200 rounded-2xl/g, "premium-card rounded-3xl"],
  [/bg-white border border-slate-200 shadow-sm rounded-xl/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white border border-slate-200 rounded-xl/g, "premium-card rounded-3xl"],
  [/bg-white border border-slate-200 shadow-sm/g, "premium-card shadow-sm"],
  [/bg-white border border-slate-200/g, "premium-card"],
  [/bg-white shadow-sm rounded-2xl/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white shadow-lg rounded-2xl/g, "premium-card rounded-3xl shadow-lg"],
  [/bg-white rounded-2xl shadow-sm/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white rounded-2xl/g, "premium-card rounded-3xl"],
  [/bg-white rounded-xl shadow-sm/g, "premium-card rounded-3xl shadow-sm"],
  [/bg-white rounded-xl/g, "premium-card rounded-3xl"],
  [/bg-white border-slate-100/g, "premium-card border-slate-100/60"],
  [/bg-white shadow-sm/g, "premium-card shadow-sm"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next"].includes(entry.name)) continue;
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
      process.stdout.write("Updated: " + path.relative(ROOT, file) + "\n");
    }
  }
}
process.stdout.write("\nDone. " + changed + " files updated.\n");
