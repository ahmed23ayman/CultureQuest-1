import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  varchar, 
  bigint 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vault = pgTable("vault", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  vaultFiles: many(vault),
}));

export const vaultRelations = relations(vault, ({ one }) => ({
  user: one(users, {
    fields: [vault.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVaultSchema = createInsertSchema(vault).pick({
  fileName: true,
  originalName: true,
  mimeType: true,
  fileSize: true,
  filePath: true,
  description: true,
  isPrivate: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVault = z.infer<typeof insertVaultSchema>;
export type Vault = typeof vault.$inferSelect;
