import { createTRPCRouter } from "../init";
import { messagesRouter } from "./messages";

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
