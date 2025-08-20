import { initTRPC } from "@trpc/server";
import type { H3Event } from "h3";
import superjson from "superjson";

export const createTRPCContext = async (event: H3Event) => {
  const runtimeConfig = useRuntimeConfig();

  return {
    session: await auth.api.getSession({
      headers: event.headers,
    }),
    runtimeConfig,
  };
};

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
// export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
export const protectedProcedure = publicProcedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new Error("Unauthorized");
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.session.user,
      },
    });
  }),
);
