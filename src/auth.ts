import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import clientPromise, { getDb, resolveDatabaseName } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";

/**
 * Resolve the JWT signing secret. Never fall back to a hardcoded default
 * (that would let anyone forge session tokens).
 */
function resolveAuthSecret(): string | undefined {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret === "default_secret") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET (or NEXTAUTH_SECRET) must be set to a strong value in production. See .env.example."
      );
    }
    // Dev-only: NextAuth will warn; still refuse the known-bad default string.
    return undefined;
  }
  if (secret.length < 16 && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be at least 16 characters in production.");
  }
  return secret;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: resolveAuthSecret(),
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: resolveDatabaseName(),
  }),
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds (604,800s)
    updateAge: 24 * 60 * 60,  // Re-validate cookie age daily
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days JWT lifetime
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Return null for any failure — do not throw user-enumerating messages.
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        if (!email || !password || password.length > 72) return null;

        try {
          const db = await getDb();
          const user = await db.collection("users").findOne({ email });

          // Same path for missing user / OAuth-only / bad password (no enumeration).
          if (!user?.password || typeof user.password !== "string") {
            return null;
          }

          const isValid = verifyPassword(password, user.password);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: (user.email as string) || email,
            name: (user.name as string) || email.split("@")[0],
            image: (user.image as string | undefined) || undefined,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    async jwt({ token, user }) {
      // Only persist the stable user id on the JWT — never OAuth access/refresh tokens.
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
