import { appRouter } from "../src/server/server";
import { prisma } from "../src/server/config/prisma";
import { TRPCError } from "@trpc/server";

const caller = appRouter.createCaller({
  session: null,
});

const authenticatedCaller = (userId: number) => appRouter.createCaller({
  session: { user: { id: userId } },
});

describe("User Router", () => {
  describe("Criação de Usuário", () => {
    it("deve criar um usuário válido", async () => {
      const user = await caller.user.create({
        name: "Test User",
        email: "test@example.com",
        password: "senhaSegura123",
      });

      expect(user).toHaveProperty("id");
      expect(user.email).toBe("test@example.com");
    });

    it("deve falhar com email duplicado", async () => {
      await caller.user.create({
        name: "Test User",
        email: "duplicate@example.com",
        password: "senhaSegura123",
      });

      await expect(
        caller.user.create({
          name: "Test User",
          email: "duplicate@example.com",
          password: "senhaSegura123",
        })
      ).rejects.toThrowError(TRPCError);
    });

    it("deve falhar com senha curta", async () => {
      await expect(
        caller.user.create({
          name: "Test User",
          email: "shortpass@example.com",
          password: "123",
        })
      ).rejects.toThrowError("senha");
    });
  });

  describe("Obtenção de Usuários", () => {
    beforeEach(async () => {
      await prisma.user.createMany({
        data: [
          { name: "User 1", email: "user1@test.com", password: "senha1" },
          { name: "User 2", email: "user2@test.com", password: "senha2" },
          { name: "User 3", email: "user3@test.com", password: "senha3" },
        ],
      });
    });

    it("deve retornar todos os usuários paginados", async () => {
      const result = await caller.user.getAll({ page: 1, limit: 2 });
      
      expect(result.users).toHaveLength(2);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
    });

    it("deve retornar usuário por ID", async () => {
      const user = await prisma.user.findFirst();
      const result = await caller.user.getById({ id: user!.id });
      
      expect(result.id).toBe(user!.id);
    });

    it("deve falhar ao buscar usuário inexistente", async () => {
      await expect(
        caller.user.getById({ id: 9999 })
      ).rejects.toThrowError("não encontrado");
    });
  });

  describe("Atualização de Usuário", () => {
    let testUser: { id: number };

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          name: "Original Name",
          email: "update@test.com",
          password: "originalPass",
        },
      });
    });

    it("deve atualizar nome do usuário", async () => {
      const updated = await authenticatedCaller(testUser.id).user.update({
        id: testUser.id,
        name: "Novo Nome",
      });

      expect(updated.name).toBe("Novo Nome");
    });

    it("deve falhar ao atualizar outro usuário", async () => {
      await expect(
        authenticatedCaller(9999).user.update({
          id: testUser.id,
          name: "Tentativa Inválida",
        })
      ).rejects.toThrowError("FORBIDDEN");
    });

    it("deve validar email inválido", async () => {
      await expect(
        authenticatedCaller(testUser.id).user.update({
          id: testUser.id,
          email: "email-invalido",
        })
      ).rejects.toThrowError("email");
    });
  });

  describe("Exclusão de Usuário", () => {
    let testUser: { id: number };

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          name: "Delete User",
          email: "delete@test.com",
          password: "deletePass",
        },
      });
    });

    it("deve deletar usuário existente", async () => {
      await authenticatedCaller(testUser.id).user.delete({ id: testUser.id });
      const user = await prisma.user.findUnique({ where: { id: testUser.id } });
      expect(user).toBeNull();
    });

    it("deve falhar ao deletar outro usuário", async () => {
      await expect(
        authenticatedCaller(9999).user.delete({ id: testUser.id })
      ).rejects.toThrowError("FORBIDDEN");
    });

    it("deve falhar ao deletar usuário inexistente", async () => {
      await expect(
        authenticatedCaller(9999).user.delete({ id: 9999 })
      ).rejects.toThrowError("NOT_FOUND");
    });
  });
});