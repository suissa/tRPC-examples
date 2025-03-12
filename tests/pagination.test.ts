describe("Pagination", () => {
  beforeAll(async () => {
    await prisma.user.createMany({
      data: Array.from({ length: 25 }, (_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@test.com`,
        password: "pass",
      })),
    });
  });

  it("deve retornar 10 itens por padrão", async () => {
    const result = await caller.user.getAll({ page: 1 });
    expect(result.users).toHaveLength(10);
  });

  it("deve calcular total de páginas corretamente", async () => {
    const result = await caller.user.getAll({ page: 2, limit: 5 });
    expect(result.totalPages).toBe(5);
    expect(result.users[0].name).toBe("User 6");
  });

  it("deve retornar página vazia se ultrapassar limite", async () => {
    const result = await caller.user.getAll({ page: 10, limit: 10 });
    expect(result.users).toHaveLength(5);
  });
});