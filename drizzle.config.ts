import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: "./.env.development",
});

export default defineConfig({
  out: "./drizzle",
  schema: "./server/utils/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.NUXT_DB_FILE_NAME!,
  },
});
