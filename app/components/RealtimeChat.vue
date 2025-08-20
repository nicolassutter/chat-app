<script setup lang="ts">
const props = defineProps<{
  roomId: number;
  username: string;
  messages: ChatMessage[];
  isAdmin: boolean;
}>();

// Reactive state
const newMessageState = reactive({
  newMessage: "",
});

// Use the composable
const {
  messages: realtimeMessages,
  sendMessage,
  isConnected,
  peers,
  kickUser,
} = useRealtimeChat({
  roomId: props.roomId,
});

const user = useUser();

// Computed properties
const allMessages = computed(() => {
  const mergedMessages = [...props.messages, ...realtimeMessages.value];
  // Remove duplicates based on message id
  const uniqueMessages = mergedMessages.filter(
    (message, index, self) =>
      index === self.findIndex((m) => m.id === message.id),
  );
  // Sort by creation date
  return uniqueMessages.sort((a, b) => a.createdAt > b.createdAt);
});

// Methods
const { containerRef, scrollToBottom } = useChatScroll();

const handleSendMessage = () => {
  if (!newMessageState.newMessage.trim() || !isConnected.value) return;

  sendMessage(newMessageState.newMessage);
  newMessageState.newMessage = "";
};

// Watchers
watch(
  allMessages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div
    class="flex flex-col h-full w-full bg-background text-foreground antialiased"
  >
    <div class="flex items-center gap-2">
      <p class="font-semibold">Currently in the room:</p>

      <ul class="flex items-center gap-2 ml-2">
        <li v-for="peer in peers" :key="peer.id">
          <UBadge class="flex items-center">
            {{ peer.name }}
            <button
              v-if="isAdmin && peer.id !== user?.id"
              title="Kick user"
              class="flex cursor-pointer"
              @click="
                () => {
                  kickUser(peer.id);
                }
              "
            >
              <UIcon name="i-lucide:trash" />
            </button>
          </UBadge>
        </li>
      </ul>
    </div>

    <!-- Messages -->
    <div ref="containerRef" class="flex-1 overflow-y-auto pb-4 space-y-4 mt-6">
      <div
        v-if="allMessages.length === 0"
        class="text-center text-sm text-muted-foreground"
      >
        No messages yet. Start the conversation!
      </div>
      <div class="space-y-1">
        <div
          v-for="(message, index) in allMessages"
          :key="message.id"
          class="animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <ChatMessage
            :message="message"
            :is-own-message="message.user.name === username"
            :show-header="
              !allMessages[index - 1] ||
              allMessages[index - 1]?.user.name !== message.user.name
            "
          />
        </div>
      </div>
    </div>

    <!-- Input Form -->
    <UForm
      :state="newMessageState"
      class="flex gap-2 items-center"
      @submit.prevent="handleSendMessage"
    >
      <UFormField name="newMessage" class="w-full">
        <UInput
          v-model="newMessageState.newMessage"
          aria-label="Message input"
          type="text"
          class="w-full"
          placeholder="Type a message..."
          :disabled="!isConnected"
        />
      </UFormField>

      <UButton
        type="submit"
        icon="i-lucide:send"
        :disabled="!isConnected || !newMessageState.newMessage.trim()"
      >
        <span class="sr-only">send</span>
      </UButton>
    </UForm>
  </div>
</template>
