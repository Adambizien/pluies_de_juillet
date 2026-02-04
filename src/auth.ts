import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/src/entities/User";
import * as bcrypt from "bcryptjs";

async function getUserRepository() {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(User);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const userRepository = await getUserRepository();

          const user = await userRepository.findOne({
            where: { email: credentials?.email as string },
          });

          if (!user) {
            throw new Error("Utilisateur non trouvé");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials?.password as string,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Mot de passe incorrect");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as unknown as Record<string, unknown>).id as string;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as unknown as Record<string, unknown>).id = token.id;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  useSecureCookies: false,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const auth = handler;
