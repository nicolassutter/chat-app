<script setup lang="ts">
import type { ChatMessage } from "@/composables/useRealtimeChat";

interface Props {
  message: ChatMessage;
  isOwnMessage: boolean;
  showHeader: boolean;
}

defineProps<Props>();

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
</script>

<template>
  <div :class="['flex mt-2', isOwnMessage ? 'justify-end' : 'justify-start']">
    <div
      :class="[
        'max-w-[75%] w-fit flex flex-col gap-1',
        { 'items-end': isOwnMessage },
      ]"
    >
      <div
        v-if="showHeader"
        :class="[
          'flex items-center gap-2 text-xs',
          { 'justify-end flex-row-reverse': isOwnMessage },
        ]"
      >
        <span class="font-medium">{{ message.user.name }}</span>
        <span v-if="message.createdAt" class="text-foreground/50 text-xs">
          {{ formatTime(message.createdAt) }}
        </span>
      </div>
      <div
        :class="[
          'py-2 px-3 rounded-xl text-sm w-fit',
          isOwnMessage
            ? 'bg-primary text-inverted'
            : 'bg-muted text-foreground',
        ]"
      >
        {{ message.content }}
      </div>
    </div>
  </div>
</template>
