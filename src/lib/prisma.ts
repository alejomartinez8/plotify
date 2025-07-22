import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const baseClient = new PrismaClient();
const prisma =
  process.env.NODE_ENV === "production"
    ? baseClient.$extends(withAccelerate())
    : baseClient;

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
