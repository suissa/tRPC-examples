describe('Segurança', () => {
  it('não deve retornar senha do usuário', async () => {
    const user = await caller.user.create({
      name: 'Security User',
      email: 'security@test.com',
      password: 'secretPass',
    });

    expect(user).not.toHaveProperty('password');
  });

  it('deve retornar erro genérico para erros de banco', async () => {
    // Mock de erro do Prisma
    vi.spyOn(prisma.user, 'create').mockRejectedValue(new Error('DB Error'));

    await expect(
      caller.user.create({
        name: 'Test',
        email: 'dberror@test.com',
        password: 'pass',
      })
    ).rejects.toThrowError('INTERNAL_SERVER_ERROR');
  });
});