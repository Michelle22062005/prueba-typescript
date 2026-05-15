import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

type AppSessionUser = {
    id?: unknown;
    role?: unknown;
};

type AppCredentialsUser = {
    id?: string;
    role?: unknown;
};

/**
 * NextAuth credentials route kept for compatibility with NextAuth flows.
 * The rest of the app mainly uses the custom JWT routes, but this handler
 * can still authenticate users through email and password credentials.
 */
const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Reject incomplete credentials before touching the database.
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                // Email is unique, so findUnique returns at most one user.
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("User not found");
                }

                // Compare the submitted password with the stored bcrypt hash.
                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!passwordMatch) {
                    throw new Error("Incorrect password");
                }

                // NextAuth stores this object in the JWT callback.
                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        // Persist custom id and role claims in the NextAuth JWT.
        async jwt({ token, user }) {
            if (user) {
                const appUser = user as AppCredentialsUser;
                token.id = user.id;
                token.role = appUser.role;
            }
            return token;
        },
        // Copy custom JWT claims into the session object exposed to the client.
        async session({ session, token }) {
            if (session.user) {
                const appSessionUser = session.user as AppSessionUser;
                appSessionUser.id = token.id;
                appSessionUser.role = token.role;
            }
            return session;
        },
    },
    pages: {
        // Reuse the app login page instead of the default NextAuth screen.
        signIn: "/login",
    },
    session: {
        // JWT sessions avoid database-backed NextAuth sessions.
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
