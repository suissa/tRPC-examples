// mocks/handlers.ts (v2.x+)
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]);
  }),

  http.post('/api/login', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ token: 'fake-jwt-token' });
  })
];