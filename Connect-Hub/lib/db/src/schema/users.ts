import { pgTable, text, serial, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  avatar: text("avatar"),
  plan: text("plan").notNull().default("free"),
  preferences: jsonb("preferences").$type<{
    defaultMicOn: boolean;
    defaultCameraOn: boolean;
    noiseCancel: boolean;
    theme: string;
    notifications: Record<string, boolean>;
  }>().default({ defaultMicOn: true, defaultCameraOn: true, noiseCancel: false, theme: "system", notifications: {} }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
