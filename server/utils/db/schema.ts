import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../auth/schema";

export * from "../auth/schema";

export const rooms = sqliteTable("rooms", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: int("created_at", { mode: "timestamp" }).notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: int("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  createdAt: int("created_at", { mode: "timestamp" }).notNull(),
  roomId: int("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
