import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaDb } from "./prismaDB"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    // ─── JWT Strategy (no adapter needed) ────────────────────────────────
    // PrismaAdapter is NOT used because it conflicts with credentials-only
    // auth + JWT. We handle DB lookups manually in authorize().
    session: { strategy: "jwt" },
    pages: {
        signIn: "/sign-in",
        error: "/sign-in",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await PrismaDb.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.password) {
                    throw new Error("User not found");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                // Return a plain object (not the full Prisma model)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name || user.username,
                    image: user.image,
                    is_admin: user.is_admin,
                    username: user.username,
                };
            }
        })
    ],
    callbacks: {
        // Attach custom fields to the JWT token on sign-in
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.is_admin = (user as any).is_admin ?? false;
                token.username = (user as any).username ?? null;
            }
            return token;
        },

        // Expose those fields on the session object
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.is_admin = token.is_admin as boolean;
                session.user.username = token.username as string | null;
            }
            return session;
        }
    }
})