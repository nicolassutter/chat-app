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
  /**
   * Send connected members in the room (peers) to the client.
   */
  z.object({
    type: z.literal("peers_update"),
    peers: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .array(),
    roomId: z.number(),
  }),
  /**
   * Notify the client that a peer has left the room.
   */
  z.object({
    type: z.literal("peer_left"),
    peer: z.object({
      id: z.string(),
    }),
  }),
  /**
   * Kick a user from the room.
   */
  z.object({
    type: z.literal("kickUser"),
    userId: z.string(),
    roomId: z.number(),
  }),
  /**
   * Notify a peer that they have been kicked from the room.
   */
  z.object({
    type: z.literal("kicked"),
    roomId: z.number(),
  }),
]);
export type WsMessage = z.infer<typeof messageSchema>;

export default defineWebSocketHandler({
  open(peer) {},

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

    if (data.type === "subscribe") {
      const channel = `messages:room=${data.roomId}`;
      peer.subscribe(channel);

      const usersInRoom = peer.peers
        .values()
        .filter((p) => {
          return p.topics.has(channel);
        })
        .map(async (p) => {
          const session = await auth.api.getSession({
            headers: p.request.headers,
          });
          const user = session?.user;
          if (!user) {
            throw new Error("User not found in session");
          }
          return {
            id: user?.id,
            name: user?.name || "Unknown",
          };
        })
        .toArray();

      const msg = {
        type: "peers_update",
        peers: await Promise.all(usersInRoom),
        roomId: data.roomId,
      } satisfies WsMessage;

      peer.send(superjson.stringify(msg));
      peer.publish(channel, superjson.stringify(msg));
    } else if (data.type === "newMessage") {
      const channel = `messages:room=${data.roomId}`;
      peer.publish(
        channel,
        superjson.stringify({
          type: "newMessage",
          message: data.message,
        }),
      );
    } else if (data.type === "kickUser") {
      const channel = `messages:room=${data.roomId}`;
      const userToKick = data.userId;

      const room = await db.query.rooms.findFirst({
        where: (rooms, { eq }) => eq(rooms.id, data.roomId),
      });

      const isAdmin = session.user.id === room?.ownerId;

      if (!isAdmin) {
        return;
      }

      const peerSessions = peer.peers
        .values()
        .filter((p) => p.topics.has(channel))
        .toArray()
        .map(async (p) => {
          const peerSession = await auth.api.getSession({
            headers: p.request.headers,
          });
          return {
            peerSession,
            peer: p,
          };
        });

      const peerToKick = (await Promise.all(peerSessions)).find(
        ({ peerSession }) => {
          return peerSession?.user.id === userToKick;
        },
      );

      if (peerToKick) {
        peerToKick.peer.send(
          superjson.stringify({
            type: "kicked",
            roomId: data.roomId,
          } satisfies WsMessage),
        );
        peerToKick.peer.close(1000, "You have been kicked from the room");
      }
    }
  },

  async close(peer) {
    const session = await auth.api.getSession({
      headers: peer.request.headers,
    });
    const user = session?.user;

    if (!user) {
      return;
    }

    const rooms = peer.topics.values().filter((topic) => {
      return topic.startsWith("messages:room=");
    });

    for (const room of rooms) {
      peer.publish(
        room,
        superjson.stringify({
          type: "peer_left",
          peer: {
            id: user.id,
          },
        } satisfies WsMessage),
      );
    }
  },
});
