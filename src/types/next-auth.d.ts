/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Auth } from "@/domain/auth/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: Auth & DefaultSession["user"];
  }

  interface User extends Auth {}
}

declare module "next-auth/jwt" {
  interface JWT extends Auth {}
}
