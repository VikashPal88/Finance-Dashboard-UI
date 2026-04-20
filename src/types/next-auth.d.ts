import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      is_admin: boolean;
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    is_admin: boolean;
    username?: string | null;
    password?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    is_admin: boolean;
    username?: string | null;
  }
}
