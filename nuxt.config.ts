// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/eslint"],
  css: ["~/assets/css/main.css"],
  build: {
    transpile: ["trpc-nuxt"],
  },
  runtimeConfig: {
    public: {
      LAST_MESSAGES_LIMIT: 10,
    },
  },
  nitro: {
    preset: "bun",
    experimental: {
      websocket: true,
    },
  },
  app: {
    head: {
      title: "Chat App",
      htmlAttrs: {
        lang: "en",
      },
    },
  },
  typescript: {
    nodeTsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
    sharedTsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
  },
});
