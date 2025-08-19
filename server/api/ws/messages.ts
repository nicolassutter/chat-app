import z from "zod";
import superjson from "superjson";

const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("subscribe"),
    roomId: z.number(),
  }),
  z.object({
    type: z.literal("newMessage"),
    roomId: z.number(),
    message: z.object({
      id: z.number(),
      content: z.string(),
      createdAt: z.date(),
      user: z.object({
        id: z.string(),
        name: z.string(),
      }),
    }),
  }),
]);
export type WsMessage = z.infer<typeof messageSchema>;

export default defineWebSocketHandler({
  open(peer) {},
  close(peer) {},
  async message(peer, message) {
    const msg = message.text();
    const headers = peer.request.headers;
    const session = await auth.api.getSession({
      headers,
    });

    if (!session?.user) {
      peer.close(1008, "Unauthorized");
      return;
    }

    const data = z
      .string()
      .transform((val) => {
        try {
          return superjson.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON");
        }
      })
      .pipe(messageSchema)
      .parse(msg);

    const channel = `messages:room=${data.roomId}`;

    if (data.type === "subscribe") {
      peer.subscribe(channel);
    } else if (data.type === "newMessage") {
      peer.publish(
        channel,
        superjson.stringify({
          type: "newMessage",
          message: data.message,
        }),
      );
    }
  },
});
