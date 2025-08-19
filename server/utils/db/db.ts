import { drizzle } from "drizzle-orm/libsql/node";
import * as schema from "./schema";
import { createClient } from "@libsql/client";

const client = createClient({ url: process.env.NUXT_DB_FILE_NAME! });
export const db = drizzle({ schema, client });
