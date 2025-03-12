import { userRouter } from './routers/user';
import { trpc } from './../client/trpc';
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { router } from './trpc';
import { Context } from './middleware/auth';

export const appRouter = router({
  user: userRouter,
});

const app = express();
app.use(cors());

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }): Context => ({
      session: req.session, // Adapte conforme seu sistema de sessão
    }),
  })
);
export type AppRouter = typeof appRouter;

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
