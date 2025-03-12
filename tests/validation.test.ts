import { appRouter } from '../src/server/server';

describe('Validações Zod', () => {
  const invalidEmails = ['invalid', 'test@', '@domain.com'];
  const invalidPasswords = ['12345', ' ', 'a'.repeat(101)];

  test.each(invalidEmails)('deve rejeitar email inválido: %s', async (email) => {
    await expect(
      appRouter.createCaller({ session: null }).user.create({
        name: 'Test',
        email,
        password: 'validPassword123',
      })
    ).rejects.toThrowError('email');
  });

  test.each(invalidPasswords)('deve rejeitar senha inválida: %s', async (password) => {
    await expect(
      appRouter.createCaller({ session: null }).user.create({
        name: 'Test',
        email: 'test@validation.com',
        password,
      })
    ).rejects.toThrowError('senha');
  });
});