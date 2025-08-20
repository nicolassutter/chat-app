<script setup lang="ts">
import { useAsyncState } from "@vueuse/core";
import z from "zod";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const state = reactive({
  email: "",
  password: "",
});

const { isLoading, execute: login } = useAsyncState(
  async () => {
    await signIn.email({
      email: state.email,
      password: state.password,
    });
    await navigateTo({
      path: "/",
    });
  },
  null,
  {
    immediate: false,
  },
);
</script>

<template>
  <UForm
    :schema
    :state
    class="flex flex-col gap-4 mx-auto max-w-lg w-full p-4"
    @submit.prevent="
      () => {
        login();
      }
    "
  >
    <UFormField label="Email" required name="email">
      <UInput v-model="state.email" type="text" class="w-full" />
    </UFormField>

    <UFormField label="Password" required name="password">
      <UInput v-model="state.password" type="password" class="w-full" />
    </UFormField>

    <UButton type="submit" class="justify-center" :loading="isLoading"
      >Login</UButton
    >
  </UForm>
</template>
