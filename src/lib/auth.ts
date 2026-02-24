import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

// Default session timeout in hours — used when no DB setting exists yet
const DEFAULT_SESSION_TIMEOUT_HOURS = 8;

/**
 * Reads the session_timeout_hours setting from the DB.
 * If the row doesn't exist yet, it auto-creates it with the default value
 * (upsert-on-first-access — no separate seed step required).
 */
async function getSessionTimeoutHours(): Promise<number> {
  try {
    const setting = await prisma.setting.upsert({
      where: { key: "session_timeout_hours" },
      update: {},
      create: {
        key: "session_timeout_hours",
        value: String(DEFAULT_SESSION_TIMEOUT_HOURS),
        label: "Session Timeout",
        description:
          "How long users stay logged in without activity (in hours). Changes apply to new logins.",
        type: "number",
      },
    });
    const parsed = parseInt(setting.value, 10);
    return isNaN(parsed) || parsed < 1 ? DEFAULT_SESSION_TIMEOUT_HOURS : parsed;
  } catch {
    // Prisma client not yet generated (first boot before generate) — fall back safely
    return DEFAULT_SESSION_TIMEOUT_HOURS;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Cookie lives for 30 days max; actual session expiry is enforced via the
  // sessionExpiresAt field embedded in the JWT by the jwt() callback below.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) {
          return null;
        }

        if (!user.isActive) {
          throw new Error("ACCOUNT_DISABLED");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // ── Fresh login ────────────────────────────────────────────────────
        // Fetch the full user record and embed role / approval status.
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.isApproved = dbUser.isApproved;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
        }

        // Embed the configured timeout so it travels with the token.
        // Timeout changes in the admin UI apply to the NEXT login.
        const hours = await getSessionTimeoutHours();
        token.sessionExpiresAt =
          Math.floor(Date.now() / 1000) + hours * 60 * 60;
      } else if (token.email) {
        // ── Token refresh ──────────────────────────────────────────────────
        // Check custom session expiry first.
        if (
          token.sessionExpiresAt &&
          Date.now() / 1000 > (token.sessionExpiresAt as number)
        ) {
          // Session has expired per our configured timeout — invalidate it.
          return null as unknown as typeof token;
        }

        // Keep role / approval status fresh so admin changes take effect.
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true, isApproved: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isApproved = dbUser.isApproved;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isApproved = token.isApproved as boolean;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | undefined;
      }
      // Expose the real expiry time to the client so the UI can show it.
      if (token.sessionExpiresAt) {
        session.expires = new Date(
          (token.sessionExpiresAt as number) * 1000
        ).toISOString();
      }
      return session;
    },
  },
});
