<script setup lang="ts">
import z from "zod";

const route = useRoute();
const roomId = computed({
  get() {
    return route.query.roomId ? Number(route.query.roomId) : undefined;
  },
  set(value) {
    navigateTo({
      path: route.path,
      query: {
        ...route.query,
        roomId: value ? String(value) : undefined,
      },
      replace: true,
    });
  },
});
const user = useUser();
const { $trpc } = useNuxtApp();

const state = reactive({
  roomName: "",
});

const schema = z.object({
  roomName: z.string().min(1, "Room name is required"),
});

const { data: rooms, refresh: refreshRooms } = useAsyncData(
  "rooms",
  async () => {
    const rooms = await $trpc.messages.getRooms.query();
    return { rooms };
  },
);

const { data: messagesData } = useAsyncData(
  "messages",
  async () => {
    if (!roomId.value) return { messages: [] };
    const messages = await $trpc.messages.getMessages.query({
      roomId: roomId.value,
    });
    return { messages };
  },
  {
    watch: [roomId],
  },
);

const currentRoom = computed(() => {
  return rooms.value?.rooms.find((room) => room.id === roomId.value);
});

async function createRoom() {
  try {
    if (!state.roomName.trim()) return;

    const newRoom = await $trpc.messages.createRoom.mutate({
      name: state.roomName,
    });
    state.roomName = "";
    refreshRooms();
    roomId.value = newRoom?.id;
  } catch (_error) {
    alert("Failed to create room, maybe this room already exists?");
  }
}

function reset() {
  roomId.value = undefined;
  state.roomName = "";
  refreshRooms();
}
</script>

<template>
  <main class="container mx-auto p-4">
    <template v-if="user && !roomId">
      <h1 class="text-2xl font-bold mb-4">
        Choose a room to connect to or create a new one
      </h1>

      <UFormField label="Select an existing room">
        <USelect
          id="room-select"
          v-model="roomId"
          :items="
            rooms?.rooms.map((room) => ({
              label: room.name,
              value: room.id,
            })) ?? []
          "
          class="mb-4 w-full max-w-42"
          value-key="value"
          label-key="label"
        />
      </UFormField>

      <UForm :schema :state @submit.prevent="createRoom" class="grid gap-4">
        <UFormField label="New room name" required name="roomName">
          <UInput v-model="state.roomName" type="text" class="w-full" />
        </UFormField>

        <UButton type="submit" class="justify-center">Create room</UButton>
      </UForm>
    </template>

    <template v-else-if="roomId && user">
      <UButton
        variant="ghost"
        icon="i-lucide:arrow-left"
        class="mb-4"
        @click="reset"
      >
        Go back
      </UButton>

      <h1 class="text-2xl font-bold mb-4">
        Connected to room: {{ currentRoom?.name }}
      </h1>

      <RealtimeChat
        :room-id
        :username="user.name"
        :messages="messagesData?.messages ?? []"
      />
    </template>
  </main>
</template>
