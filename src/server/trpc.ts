import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./middleware/auth";
import { authMiddleware } from "./middleware/auth"; // Importação adicionada

// Inicializa o tRPC com contexto tipado
const t = initTRPC.context<Context>().create();

// Exporta as funções base
export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

// Cria procedure protegida com autenticação
export const protectedProcedure = t.procedure.use(authMiddleware);