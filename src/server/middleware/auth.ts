import {  initTRPC, TRPCError } from '@trpc/server';

const t = initTRPC.context<Context>().create();
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.session.user,
    },
  });
});

export type Context = {
  session?: {
    user: { id: number; email: string };
  };
};