import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/auth";
import { UserInfo } from "@/src/entities/UserInfo";
import { getUserRole } from "@/lib/getUserRole";

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

    const userId = parseInt((session.user as unknown as Record<string, unknown>).id as string);
    const userRole = await getUserRole(userId);

    const userInfoRepository = await getUserInfoRepository();
    const userInfo = await userInfoRepository.findOne({
      where: { userId },
    });

    if (!userInfo) {
      return Response.json({ error: "Informations utilisateur non trouvées" }, { status: 404 });
    }

    return Response.json({
      firstname: userInfo.firstname,
      lastname: userInfo.lastname,
      phone: userInfo.phone,
      dateOfBirth: userInfo.dateOfBirth,
      role: userRole,
    });
  } catch (error) {
    console.error("Erreur récupération infos utilisateur:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { firstname, lastname, phone, dateOfBirth } = body;

    if (phone && !/^[0-9+\s()-]*$/.test(phone)) {
      return Response.json(
        { error: "Le numéro de téléphone contient des caractères non autorisés" },
        { status: 400 }
      );
    }

    const userInfoRepository = await getUserInfoRepository();
    const userInfo = await userInfoRepository.findOne({
      where: { userId: parseInt((session.user as unknown as Record<string, unknown>).id as string) },
    });

    if (!userInfo) {
      return Response.json({ error: "Informations utilisateur non trouvées" }, { status: 404 });
    }

    if (firstname) userInfo.firstname = firstname;
    userInfo.lastname = lastname || null;
    userInfo.phone = phone || null;
    userInfo.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;

    await userInfoRepository.save(userInfo);

    return Response.json({
      message: "Informations mises à jour",
      data: {
        firstname: userInfo.firstname,
        lastname: userInfo.lastname,
        phone: userInfo.phone,
        dateOfBirth: userInfo.dateOfBirth,
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour infos utilisateur:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}