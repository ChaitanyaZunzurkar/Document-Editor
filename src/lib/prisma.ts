import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // Import the adapter

const prismaClientSingleton = () => {
  // 1. Initialize the adapter with your database connection string
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  // 2. Pass the adapter into the PrismaClient Options
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton };

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;