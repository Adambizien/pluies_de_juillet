import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/auth";
import { UserInfo } from "@/src/entities/UserInfo";

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

    const userInfoRepository = await getUserInfoRepository();
    const userInfo = await userInfoRepository.findOne({
      where: { userId: parseInt((session.user as unknown as Record<string, unknown>).id as string) },
    });

    if (!userInfo) {
      return Response.json({ error: "Informations utilisateur non trouvées" }, { status: 404 });
    }

    return Response.json({
      firstname: userInfo.firstname,
      lastname: userInfo.lastname,
      phone: userInfo.phone,
      dateOfBirth: userInfo.dateOfBirth,
    });
  } catch (error) {
    console.error("Erreur récupération infos utilisateur:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
