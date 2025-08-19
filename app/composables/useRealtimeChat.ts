import { useWebSocket } from "@vueuse/core";
import type { WsMessage } from "~~/server/api/ws/messages";
import type { AppRouterOutput } from "~~/server/trpc/routers";
import superjson from "superjson";

interface UseRealtimeChatProps {
  roomId: number;
}

export type ChatMessage = AppRouterOutput["messages"]["send"]["message"];

export function useRealtimeChat({ roomId }: UseRealtimeChatProps) {
  const { open, send, close, status } = useWebSocket("/api/ws/messages", {
    immediate: false,
    async onMessage(_ws, event) {
      const msg = event.data;

      try {
        const data = superjson.parse(msg) as WsMessage;

        if (data.type === "newMessage") {
          messages.value.push(data.message);
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
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

  const sendMessage = async (content: string) => {
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
  };

  onUnmounted(() => {
    close();
  });

  const isConnected = computed(() => status.value === "OPEN");
  return { messages, sendMessage, isConnected };
}
