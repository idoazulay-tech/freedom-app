import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { casesRouter } from "./routers/cases";
import { documentsRouter } from "./routers/documents";
import { tasksRouter } from "./routers/tasks";
import { consentRouter } from "./routers/consent";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Freedom routers
  cases: casesRouter,
  documents: documentsRouter,
  tasks: tasksRouter,
  consent: consentRouter,
});

export type AppRouter = typeof appRouter;
