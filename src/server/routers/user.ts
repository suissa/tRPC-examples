import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const prisma = new PrismaClient();

export const userRouter = router({
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string()
        .email("Formato de email inválido")
        .refine(async (email) => {
          // Verifica se o email já existe
          const exists = await prisma.user.findUnique({ 
            where: { email } 
          });
          return !exists;
        }, "Email já cadastrado"), // Mensagem de erro customizada
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.user.create({
          data: {
            name: input.name,
            email: input.email,
            password: await hash(input.password, 12), // Hash da senha
          },
          select: { // Seleção explícita de campos
            id: true,
            name: true,
            email: true,
            createdAt: true,
          }
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha na criação do usuário",
        });
      }
    }),

  getAll: publicProcedure
    .query(async () => {
      return prisma.user.findMany();
    }),

  getById: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      return prisma.user.findUnique({
        where: { id: input.id }
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.user.update({
        where: { id },
        data
      });
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      return prisma.user.delete({
        where: { id: input.id }
      });
    }),
});

function hash(password: any, arg1: number) {
  throw new Error("Function not implemented.");
}
