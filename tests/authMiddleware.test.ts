import { TRPCError } from "@trpc/server";
import { appRouter } from "../src/server/server";
import { prisma } from "../src/server/config/prisma"

describe("Auth Middleware", () => {
  it("deve bloquear acesso não autenticado", async () => {
    const caller = appRouter.createCaller({ session: null });
    
    await expect(
      caller.user.update({ id: 1, name: "Test" })
    ).rejects.toThrowError("UNAUTHORIZED");
  });

  it("deve permitir acesso autenticado", async () => {
    const user = await prisma.user.create({
      data: { name: "Auth Test", email: "auth@test.com", password: "pass" },
    });
    
    const caller = appRouter.createCaller({
      session: { user: { id: user.id } },
    });

    const result = await caller.user.getById({ id: user.id });
    expect(result.id).toBe(user.id);
  });
});