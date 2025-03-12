// tests/security.test.ts
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { prisma } from "../src/server/config/prisma";
import { appRouter } from "../src/server/server";
import { hash } from "bcrypt";

// Cria caller para testes
const caller = appRouter.createCaller({
  session: null,
});

describe("Testes de Segurança", () => {
  beforeAll(async () => {
    // Conecta ao banco de dados
    await prisma.$connect();
  });

  afterAll(async () => {
    // Desconecta do banco
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Limpa dados antes de cada teste
    await prisma.user.deleteMany();
  });

  describe("Proteção de Dados Sensíveis", () => {
    it("não deve retornar senha do usuário na criação", async () => {
      const user = await caller.user.create({
        name: "Usuário Secreto",
        email: "seguro@teste.com",
        password: "senhaSuperSecreta123",
      });

      // Verifica campos retornados
      expect(user).toEqual({
        id: expect.any(Number),
        name: "Usuário Secreto",
        email: "seguro@teste.com",
        createdAt: expect.any(Date),
      });

      // Garante que a senha não está presente
      expect(user).not.toHaveProperty("password");
    });

    it("não deve retornar senha em consultas", async () => {
      // Cria usuário diretamente para teste
      const dbUser = await prisma.user.create({
        data: {
          name: "Usuário Banco",
          email: "banco@teste.com",
          password: await hash("senhaHash", 12),
        },
      });

      const apiUser = await caller.user.getById({ id: dbUser.id });

      // Verifica campos sensíveis ausentes
      expect(apiUser).toEqual({
        id: dbUser.id,
        name: "Usuário Banco",
        email: "banco@teste.com",
        createdAt: expect.any(Date),
      });
      expect(apiUser).not.toHaveProperty("password");
    });
  });

  describe("Tratamento de Erros Seguro", () => {
    it("deve mascarar erros do banco de dados", async () => {
      // Mock de erro genérico do Prisma
      vi.spyOn(prisma.user, "create").mockRejectedValue(
        new Error("Falha catastrófica no banco")
      );

      await expect(
        caller.user.create({
          name: "Erro Teste",
          email: "erro@teste.com",
          password: "senha123",
        })
      ).rejects.toThrow(TRPCError);

      // Verifica tipo de erro e mensagem
      try {
        await caller.user.create({
          name: "Erro Teste",
          email: "erro@teste.com",
          password: "senha123",
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect(error.code).toBe("INTERNAL_SERVER_ERROR");
        expect(error.message).toMatch("Falha na criação do usuário");
      }
    });

    it("deve prevenir SQL Injection", async () => {
      const maliciousInput = {
        name: "Robert'); DROP TABLE Users;--",
        email: "hacker@example.com'; DROP TABLE Users;--",
        password: "123456",
      };

      await expect(
        caller.user.create(maliciousInput)
      ).rejects.toThrow(TRPCError);

      // Verifica que nenhum dado foi persistido
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(0);
    });
  });

  describe("Validação de Entrada", () => {
    it("deve rejeitar emails inválidos", async () => {
      await expect(
        caller.user.create({
          name: "Email Inválido",
          email: "email-ruim",
          password: "senha123",
        })
      ).rejects.toThrow("Formato de email inválido");
    });

    it("deve bloquear emails duplicados", async () => {
      await caller.user.create({
        name: "Original",
        email: "duplicado@teste.com",
        password: "senha123",
      });

      await expect(
        caller.user.create({
          name: "Cópia",
          email: "duplicado@teste.com",
          password: "senha456",
        })
      ).rejects.toThrow("Email já cadastrado");
    });
  });
});