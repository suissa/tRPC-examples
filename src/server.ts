import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { userRouter } from './routers/user';
import { router } from './trpc';

const appRouter = router({
  user: userRouter,
});

const app = express();
app.use(cors());

app.use('/trpc', createExpressMiddleware({
  router: appRouter,
}));

export type AppRouter = typeof appRouter;

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});