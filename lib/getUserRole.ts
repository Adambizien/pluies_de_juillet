export async function getUserRole(userId: string | number): Promise<string | null> {
  try {
    const { AppDataSource } = await import("@/src/data-source");
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const { User } = await import("@/src/entities/User");
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ 
      where: { id: typeof userId === 'string' ? parseInt(userId) : userId } 
    });
    return user?.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}
