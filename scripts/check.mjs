import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const root = process.cwd();
const failures = [];
const functionFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith(".js")) functionFiles.push(path);
  }
}
walk(join(root, "functions"));
for (const file of functionFiles) {
  try { execFileSync(process.execPath, ["--check", file], { stdio: "pipe" }); }
  catch (error) { failures.push("JavaScript syntax: " + relative(root, file) + " — " + (error.stderr?.toString() || error.message)); }
}
const pages = ["index.html", "admin/index.html"];
const headers = readFileSync(join(root, "_headers"), "utf8");
const middleware = readFileSync(join(root, "functions/_middleware.js"), "utf8");
for (const page of pages) {
  if (!existsSync(join(root, page))) { failures.push("Missing page: " + page); continue; }
  const html = readFileSync(join(root, page), "utf8");
  if (/\son[a-z]+\s*=/.test(html)) failures.push("Inline event handler found in " + page);
  if (/\sstyle\s*=/.test(html)) failures.push("Inline style attribute found in " + page);
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+\.(?:png|webp|jpg|jpeg))["']/gi)) {
    const asset = match[1].replace(/^\//, "");
    if (!existsSync(join(root, asset))) failures.push("Missing asset referenced by " + page + ": " + asset);
  }
  for (const tag of ["style", "script"]) {
    for (const match of html.matchAll(new RegExp("<" + tag + ">([\\s\\S]*?)<\\/" + tag + ">", "gi"))) {
      const hash = "'sha256-" + createHash("sha256").update(match[1], "utf8").digest("base64") + "'";
      if (!headers.includes(hash) || !middleware.includes(hash)) failures.push("CSP hash missing for " + tag + " block in " + page);
    }
  }
}

// Basic security invariants for public endpoints.
const securityFiles = {
  "functions/api/auth/login.js": ["isSameOrigin", "Content-Length", "set-cookie"],
  "functions/api/public/orders.js": ["isSameOrigin", "SUPABASE_SECRET_KEY", "unit_price", "payment_method"],
  "functions/api/public/inquiries.js": ["isSameOrigin", "Content-Length"],
};
for (const [path, markers] of Object.entries(securityFiles)) {
  if (!existsSync(join(root, path))) { failures.push("Missing security-critical endpoint: " + path); continue; }
  const source = readFileSync(join(root, path), "utf8");
  for (const marker of markers) if (!source.includes(marker)) failures.push("Security invariant missing in " + path + ": " + marker);
}

if (failures.length) {
  for (const failure of failures) console.error("FAIL: " + failure);
  process.exit(1);
}
console.log("HAUA GROUP checks passed: JavaScript syntax, local assets, no inline handlers/styles, and CSP hashes.");
