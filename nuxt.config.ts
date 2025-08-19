// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/eslint"],
  css: ["~/assets/css/main.css"],
  build: {
    transpile: ["trpc-nuxt"],
  },
  runtimeConfig: {
    // DB_FILE_NAME: process.env.DB_FILE_NAME,
  },
});
