import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/auth";
import { User } from "@/src/entities/User";
import { getUserRole } from "@/lib/getUserRole";

async function getUserRepository() {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(User);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = (session.user as unknown as Record<string, unknown>).id as string;
    const userRole = await getUserRole(userId);
    if (userRole !== "admin") {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const userRepository = await getUserRepository();

    const users = await userRepository.find({
      relations: ["userInfo"],
      order: { createdAt: "DESC" },
    });

    const usersWithInfo = users.map((user) => {
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        firstname: user.userInfo?.firstname,
        lastname: user.userInfo?.lastname,
        phone: user.userInfo?.phone,
        dateOfBirth: user.userInfo?.dateOfBirth,
      };
    });

    return Response.json(usersWithInfo);
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const currentUserId = (session.user as unknown as Record<string, unknown>).id as string;
    const userRole = await getUserRole(currentUserId);
    if (userRole !== "admin") {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return Response.json({ error: "userId et role requis" }, { status: 400 });
    }

    if (role !== "user" && role !== "admin") {
      return Response.json({ error: "Rôle invalide" }, { status: 400 });
    }

    const userRepository = await getUserRepository();
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return Response.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    user.role = role;
    await userRepository.save(user);

    return Response.json({ message: "Rôle modifié avec succès", user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Erreur modification utilisateur:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const currentUserId = (session.user as unknown as Record<string, unknown>).id as string;
    const userRole = await getUserRole(currentUserId);
    
    if (userRole !== "admin") {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId requis" }, { status: 400 });
    }

    const userIdNum = parseInt(userId);
    
    if (userIdNum === parseInt(currentUserId)) {
      return Response.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
    }

    const userRepository = await getUserRepository();
    const user = await userRepository.findOne({ where: { id: userIdNum } });

    if (!user) {
      return Response.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    await userRepository.remove(user);

    return Response.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}