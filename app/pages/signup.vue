<script setup lang="ts">
import z from "zod";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1, "Name is required"),
});

const state = reactive({
  email: "",
  password: "",
  name: "",
});

async function submit() {
  await signUp.email({
    email: state.email,
    password: state.password,
    name: state.name,
  });
  await navigateTo({
    path: "/",
  });
}
</script>

<template>
  <UForm
    :schema
    :state
    class="flex flex-col gap-4 mx-auto max-w-lg w-full"
    @submit.prevent="submit"
  >
    <UFormField label="Name" required name="name">
      <UInput v-model="state.name" type="text" class="w-full" />
    </UFormField>

    <UFormField label="Email" required name="email">
      <UInput v-model="state.email" type="text" class="w-full" />
    </UFormField>

    <UFormField label="Password" required name="password">
      <UInput v-model="state.password" type="password" class="w-full" />
    </UFormField>

    <UButton type="submit" class="justify-center">Sign Up</UButton>
  </UForm>
</template>
