import { AppDataSource } from "@/src/data-source";

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return;

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connected successfully");
    }
    isInitialized = true;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}
