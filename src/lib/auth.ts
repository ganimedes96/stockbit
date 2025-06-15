import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "@/domain/auth/requests";
import type { Auth } from "@/domain/auth/types";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são necessários");
        }
        try {
          const auth = await login(credentials);
          console.log("Auth response:", auth);

          if (auth) {
            return auth;
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token.id = session.id;
        token.email = session.email;
        token.firstName = session.firstName;
        token.lastName = session.lastName;
        token.customerId = session.customerId;
        token.phone = session.phone;
        token.role = session.role;
        token.company = session.company;
        token.createdAt = session.createdAt;
        token.subscription = session.subscription;
        token.emailVerified = session.emailVerified as boolean;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.customerId = user.customerId;
        token.phone = user.phone;
        token.role = user.role;
        token.company = user.company;
        token.imagePath = user.imagePath;
        token.isTrial = user.isTrial;
        token.subscription = user.subscription;
        token.emailVerified = user.emailVerified as boolean;
        token.createdAt = user.createdAt;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session) {
        session.user = token as Auth;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 1, // 1 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
