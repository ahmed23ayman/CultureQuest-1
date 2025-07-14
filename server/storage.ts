import { users, vault, type User, type InsertUser, type Vault, type InsertVault } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vault operations
  getVaultFiles(userId: number): Promise<Vault[]>;
  getVaultFile(id: number, userId: number): Promise<Vault | undefined>;
  createVaultFile(vaultFile: InsertVault & { userId: number }): Promise<Vault>;
  updateVaultFile(id: number, userId: number, updates: Partial<InsertVault>): Promise<Vault | undefined>;
  deleteVaultFile(id: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Vault operations
  async getVaultFiles(userId: number): Promise<Vault[]> {
    return await db
      .select()
      .from(vault)
      .where(eq(vault.userId, userId));
  }

  async getVaultFile(id: number, userId: number): Promise<Vault | undefined> {
    const [file] = await db
      .select()
      .from(vault)
      .where(and(eq(vault.id, id), eq(vault.userId, userId)));
    return file || undefined;
  }

  async createVaultFile(vaultFile: InsertVault & { userId: number }): Promise<Vault> {
    const [file] = await db
      .insert(vault)
      .values(vaultFile)
      .returning();
    return file;
  }

  async updateVaultFile(id: number, userId: number, updates: Partial<InsertVault>): Promise<Vault | undefined> {
    const [file] = await db
      .update(vault)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(vault.id, id), eq(vault.userId, userId)))
      .returning();
    return file || undefined;
  }

  async deleteVaultFile(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(vault)
      .where(and(eq(vault.id, id), eq(vault.userId, userId)));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
