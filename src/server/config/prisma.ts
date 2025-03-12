// src/server/config/prisma.ts
import { PrismaClient } from "@prisma/client";

// Cria uma única instância global do Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuração do cliente Prisma
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"]
});

// Mantém a instância em desenvolvimento para hot-reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Tipagem para o Prisma Client
export type PrismaClientType = typeof prisma;