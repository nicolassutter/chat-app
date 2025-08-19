import { createTRPCRouter, protectedProcedure } from "../init";
import z from "zod";
import { chatMessages } from "../../utils/db/schema";

export const messagesRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1, "Content is required"),
        roomId: z.int().min(1, "Room ID is required"),
      }),
    )
    .mutation(async ({ input, ctx: { user } }) => {
      const { content, roomId } = input;

      const message: typeof chatMessages.$inferInsert = {
        content,
        createdAt: new Date(),
        roomId,
        userId: user.id,
      };

      await db.insert(chatMessages).values(message);
      return {
        success: true,
        message: {
          ...message,
          user: {
            name: user.name,
            id: user.id,
          },
        },
      };
    }),
});
