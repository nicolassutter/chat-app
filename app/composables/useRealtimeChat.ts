import { useWebSocket } from "@vueuse/core";
import type { WsMessage } from "~~/server/api/ws/messages";
import type { AppRouterOutput } from "~~/server/trpc/routers";
import superjson from "superjson";

interface UseRealtimeChatProps {
  roomId: number;
}

export type ChatMessage = AppRouterOutput["messages"]["send"]["message"];

export function useRealtimeChat({ roomId }: UseRealtimeChatProps) {
  const peers = ref<{ id: string; name: string }[]>([]);
  const toast = useToast();

  const { open, send, close, status } = useWebSocket("/api/ws/messages", {
    immediate: false,
    async onMessage(_ws, event) {
      const msg = event.data;

      try {
        console.log("Received WS message:", msg);
        const data = superjson.parse(msg) as WsMessage;

        if (data.type === "newMessage") {
          messages.value.push(data.message);
        }

        if (data.type === "peers_update") {
          peers.value = data.peers;
        }

        if (data.type === "peer_left") {
          peers.value = peers.value.filter((p) => p.id !== data.peer.id);
        }

        if (data.type === "kicked") {
          toast.add({
            title: "You have been kicked from the room",
            description: "You will be redirected to the home page.",
            color: "warning",
          });

          navigateTo({
            path: "/",
            query: {},
          });
        }
      } catch (e) {
        toast.add({
          title: "Error",
          description: "Failed to parse WebSocket message.",
          color: "error",
        });
      }
    },
  });

  function subscribeToRoom(roomId: number) {
    send(
      superjson.stringify({ type: "subscribe", roomId } satisfies WsMessage),
    );
  }

  onMounted(() => {
    open();
    subscribeToRoom(roomId);
  });

  const { $trpc } = useNuxtApp();
  const messages = ref<ChatMessage[]>([]);

  async function sendMessage(content: string) {
    const { message } = await $trpc.messages.send.mutate({
      content,
      roomId,
    });
    messages.value = [...messages.value, message];
    send(
      superjson.stringify({
        type: "newMessage",
        message,
        roomId,
      } satisfies WsMessage),
    );
  }

  function kickUser(userId: string) {
    send(
      superjson.stringify({
        type: "kickUser",
        userId,
        roomId,
      } satisfies WsMessage),
    );
  }

  onUnmounted(() => {
    close();
  });

  const isConnected = computed(() => status.value === "OPEN");
  return { messages, sendMessage, isConnected, peers, kickUser };
}
