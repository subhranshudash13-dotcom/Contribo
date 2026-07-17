import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import clientPromise, { getDb, resolveDatabaseName } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";
import jwt from "jsonwebtoken";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: resolveDatabaseName(),
  }),
  session: { strategy: "jwt" },
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
        if (!credentials?.email || !credentials?.password) return null;

        const db = await getDb();
        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Find user in MongoDB
        const user = await db.collection("users").findOne({ email });

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        // Verify password
        const isValid = verifyPassword(password, user.password as string);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Generate Access and Refresh Tokens
        const accessToken = jwt.sign(
          { id: user._id.toString(), email: user.email },
          process.env.AUTH_SECRET || "default_secret",
          { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
          { id: user._id.toString() },
          process.env.AUTH_SECRET || "default_secret",
          { expiresIn: "7d" }
        );
        
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { refreshToken } }
        );

        return {
          id: user._id.toString(),
          email: user.email as string,
          name: user.name as string,
          accessToken,
          refreshToken,
        };
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        if ((user as any).accessToken) token.accessToken = (user as any).accessToken;
        if ((user as any).refreshToken) token.refreshToken = (user as any).refreshToken;
      }
      if (account) {
        if (account.access_token) token.accessToken = account.access_token;
        if (account.refresh_token) token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }
      return session;
    },
  },
});
