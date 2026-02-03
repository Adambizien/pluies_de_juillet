import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/auth";
import { User } from "@/src/entities/User";
import { UserInfo } from "@/src/entities/UserInfo";

async function getUserRepository() {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(User);
}

async function getUserInfoRepository() {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(UserInfo);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const userRepository = await getUserRepository();
    const userInfoRepository = await getUserInfoRepository();

    const users = await userRepository.find({
      order: { createdAt: "DESC" },
    });

    const usersWithInfo = await Promise.all(
      users.map(async (user) => {
        const userInfo = await userInfoRepository.findOne({
          where: { userId: user.id },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          firstname: userInfo?.firstname,
          lastname: userInfo?.lastname,
        };
      })
    );

    return Response.json(usersWithInfo);
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
