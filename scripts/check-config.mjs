/**
 * Pre-dev config sanity check.
 * Verifies that the port in NEXTAUTH_URL (.env.local) matches the --port flag
 * in the dev script (package.json). A mismatch causes Google OAuth redirect_uri
 * errors because the callback URL sent to Google won't match what's registered
 * in Google Cloud Console.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// --- Read NEXTAUTH_URL port from .env.local ---
let envPort = null;
try {
  const envContent = readFileSync(resolve(root, ".env.local"), "utf8");
  const match = envContent.match(/^NEXTAUTH_URL\s*=\s*"?https?:\/\/[^:]+:(\d+)/m);
  if (match) envPort = match[1];
} catch {
  // .env.local missing entirely — not our job to enforce that here
}

// --- Read --port flag from package.json dev script ---
let scriptPort = null;
try {
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  const devScript = pkg?.scripts?.dev ?? "";
  const match = devScript.match(/--port\s+(\d+)/);
  if (match) scriptPort = match[1];
} catch {
  // ignore
}

// --- Compare ---
const issues = [];

if (envPort && scriptPort && envPort !== scriptPort) {
  issues.push(
    `  Port mismatch detected!\n` +
    `    .env.local  NEXTAUTH_URL port : ${envPort}\n` +
    `    package.json dev --port        : ${scriptPort}\n` +
    `\n` +
    `  These must match, AND the Google Cloud Console OAuth redirect URI must be:\n` +
    `    http://localhost:${scriptPort}/api/auth/callback/google\n` +
    `\n` +
    `  If you changed the dev port, update NEXTAUTH_URL in .env.local and\n` +
    `  re-register the redirect URI at https://console.cloud.google.com/apis/credentials`
  );
}

if (issues.length > 0) {
  console.error("\n\x1b[33m⚠  CONFIG WARNING (Google OAuth will not work until resolved):\x1b[0m\n");
  issues.forEach((msg) => console.error("\x1b[33m" + msg + "\x1b[0m"));
  console.error("");
  // Warn but don't block — dev server should still start for non-OAuth work
}
