import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/auth";
import { EventCategory } from "@/src/entities/EventCategory";
import { NextRequest, NextResponse } from "next/server";

async function getRepository<T>(entity: new () => T) {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(entity);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const categoryRepository = await getRepository(EventCategory);
    const categories = await categoryRepository.find({
      order: { createdAt: "DESC" },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Erreur récupération catégories événements:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Le nom de la catégorie est requis" },
        { status: 400 }
      );
    }

    const categoryRepository = await getRepository(EventCategory);

    const existingCategory = await categoryRepository.findOne({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Cette catégorie existe déjà" },
        { status: 409 }
      );
    }

    const newCategory = categoryRepository.create({
      name: name.trim(),
    });

    const savedCategory = await categoryRepository.save(newCategory);

    return NextResponse.json(savedCategory, { status: 201 });
  } catch (error) {
    console.error("Erreur création catégorie événement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id, name } = await req.json();

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { error: "L'ID et le nom sont requis" },
        { status: 400 }
      );
    }

    const categoryRepository = await getRepository(EventCategory);

    const category = await categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    category.name = name.trim();
    const updatedCategory = await categoryRepository.save(category);

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Erreur modification catégorie événement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as unknown as Record<string, unknown>).role as string;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("categoryId");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la catégorie est requis" },
        { status: 400 }
      );
    }

    const categoryRepository = await getRepository(EventCategory);

    const category = await categoryRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    await categoryRepository.remove(category);

    return NextResponse.json({ message: "Catégorie supprimée" }, { status: 200 });
  } catch (error) {
    console.error("Erreur suppression catégorie événement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
