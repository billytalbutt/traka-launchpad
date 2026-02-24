/**
 * Resilient sign-out utility.
 *
 * The standard `signOut()` from next-auth/react requires the Next.js server
 * to be reachable (it fetches a CSRF token then POSTs to /api/auth/signout).
 * If the server is down or a Turbopack hot-reload crashed it, that fetch
 * throws ERR_CONNECTION_REFUSED and the user is permanently stuck logged in.
 *
 * This wrapper:
 *   1. Tries the normal signOut() call.
 *   2. On any failure, clears all known Auth.js / NextAuth session cookies
 *      client-side and forces a hard redirect to /login so the user is never
 *      left stranded.
 */

import { signOut } from "next-auth/react";

// Auth.js v5 / NextAuth v4 cookie names (HTTP dev + HTTPS prod variants).
const AUTH_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.callback-url",
  "authjs.csrf-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "next-auth.csrf-token",
];

function clearAuthCookies() {
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  AUTH_COOKIE_NAMES.forEach((name) => {
    document.cookie = `${name}=; ${expired}`;
    // Also clear for the current hostname (some browsers scope by domain)
    document.cookie = `${name}=; ${expired}; domain=${window.location.hostname}`;
  });
}

export async function resilientSignOut(callbackUrl = "/login") {
  try {
    await signOut({ callbackUrl, redirect: true });
  } catch {
    // Server unreachable (crashed, stopped, network blip).
    // Manually expire all session cookies so the app treats the user as
    // logged out, then force a full page reload to /login.
    clearAuthCookies();
    window.location.href = callbackUrl;
  }
}
