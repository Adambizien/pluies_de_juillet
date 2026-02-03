import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/src/entities/User";
import * as bcrypt from "bcryptjs";

// Fonction pour initialiser et obtenir la repo utilisateur
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
        token.role = (user as unknown as Record<string, unknown>).role as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const auth = handler;
