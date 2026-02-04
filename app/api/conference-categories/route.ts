import { NextResponse } from "next/server";
import { ConferenceCategory } from "@/src/entities/ConferenceCategory";

async function getRepository<T>(entity: new () => T) {
  const { AppDataSource } = await import("@/src/data-source");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource.getRepository(entity);
}

export async function GET() {
  try {
    const categoryRepository = await getRepository(ConferenceCategory);
    const categories = await categoryRepository.find({
      order: { name: "ASC" },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching conference categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch conference categories" },
      { status: 500 }
    );
  }
}
