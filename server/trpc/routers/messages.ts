import { createTRPCRouter, protectedProcedure } from "../init";
import z from "zod";
import { chatMessages, rooms } from "../../utils/db/schema";
import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";

export const messagesRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1, "Content is required"),
        roomId: z.int().min(1, "Room ID is required"),
      }),
    )
    .mutation(async ({ input, ctx: { user } }) => {
      try {
        const { content, roomId } = input;

        const message: typeof chatMessages.$inferInsert = {
          content,
          createdAt: new Date(),
          roomId,
          userId: user.id,
        };

        const [inserted] = await db
          .insert(chatMessages)
          .values(message)
          .returning();

        return {
          message: {
            ...inserted,
            user: {
              name: user.name,
              id: user.id,
            },
          },
        };
      } catch (error) {
        console.error("Error saving message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    }),

  getMessages: protectedProcedure
    .input(z.object({ roomId: z.number().min(1, "Room ID is required") }))
    .query(async ({ input }) => {
      try {
        const { roomId } = input;

        const data = await db
          .select()
          .from(chatMessages)
          .innerJoin(user, eq(chatMessages.userId, user.id))
          .where(eq(chatMessages.roomId, roomId))
          .orderBy(asc(chatMessages.createdAt))
          .limit(10);

        const messages = data.map(({ chat_messages: message, user }) => ({
          ...message,
          user: {
            id: user.id,
            name: user.name,
          },
        }));

        return messages;
      } catch (error) {
        console.error("Error fetching messages:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch messages",
        });
      }
    }),

  getRooms: protectedProcedure.query(async () => {
    try {
      const allRooms = await db.select().from(rooms);
      return allRooms;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch rooms",
      });
    }
  }),

  createRoom: protectedProcedure
    .input(z.object({ name: z.string().min(1, "Room name is required") }))
    .mutation(async ({ input, ctx: { user } }) => {
      try {
        const { name } = input;

        const [insertedRoom] = await db
          .insert(rooms)
          .values({
            name,
            createdAt: new Date(),
            ownerId: user.id,
          })
          .returning();

        return insertedRoom;
      } catch (error) {
        console.error("Error creating room:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create room",
        });
      }
    }),
});
