import {
  users,
  capsules,
  capsuleRecipients,
  payments,
  type User,
  type UpsertUser,
  type Capsule,
  type InsertCapsule,
  type UpdateCapsule,
  type CapsuleRecipient,
  type InsertCapsuleRecipient,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSubscription(userId: string, tier: string, expiresAt: Date): Promise<User>;
  
  getCapsule(id: string): Promise<Capsule | undefined>;
  getUserCapsules(userId: string): Promise<Capsule[]>;
  createCapsule(capsule: InsertCapsule): Promise<Capsule>;
  updateCapsule(id: string, updates: UpdateCapsule): Promise<Capsule>;
  deleteCapsule(id: string): Promise<void>;
  getScheduledCapsules(): Promise<Capsule[]>;
  markCapsuleAsDelivered(id: string): Promise<Capsule>;
  markCapsuleAsViewed(id: string): Promise<Capsule>;
  
  addCapsuleRecipients(recipients: InsertCapsuleRecipient[]): Promise<CapsuleRecipient[]>;
  getCapsuleRecipients(capsuleId: string): Promise<CapsuleRecipient[]>;
  markRecipientAsDelivered(recipientId: string): Promise<CapsuleRecipient>;
  markRecipientAsViewed(recipientId: string): Promise<CapsuleRecipient>;
  
  getCapsuleAnalytics(userId: string): Promise<{
    totalCapsules: number;
    deliveredCapsules: number;
    scheduledCapsules: number;
    selfDestructedCapsules: number;
  }>;
  
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(stripePaymentId: string, status: string): Promise<Payment>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserSubscription(userId: string, tier: string, expiresAt: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionTier: tier,
        subscriptionExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getCapsule(id: string): Promise<Capsule | undefined> {
    const [capsule] = await db.select().from(capsules).where(eq(capsules.id, id));
    return capsule;
  }

  async getUserCapsules(userId: string): Promise<Capsule[]> {
    return await db
      .select()
      .from(capsules)
      .where(eq(capsules.userId, userId))
      .orderBy(desc(capsules.scheduledFor));
  }

  async createCapsule(capsuleData: InsertCapsule): Promise<Capsule> {
    const [capsule] = await db.insert(capsules).values(capsuleData).returning();
    return capsule;
  }

  async updateCapsule(id: string, updates: UpdateCapsule): Promise<Capsule> {
    const [capsule] = await db
      .update(capsules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(capsules.id, id))
      .returning();
    return capsule;
  }

  async deleteCapsule(id: string): Promise<void> {
    await db.delete(capsules).where(eq(capsules.id, id));
  }

  async getScheduledCapsules(): Promise<Capsule[]> {
    const now = new Date();
    return await db
      .select()
      .from(capsules)
      .where(eq(capsules.status, 'scheduled'))
      .orderBy(asc(capsules.scheduledFor));
  }

  async markCapsuleAsDelivered(id: string): Promise<Capsule> {
    const [capsule] = await db
      .update(capsules)
      .set({
        status: 'delivered',
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(capsules.id, id))
      .returning();
    return capsule;
  }

  async markCapsuleAsViewed(id: string): Promise<Capsule> {
    const [capsule] = await db
      .update(capsules)
      .set({
        viewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(capsules.id, id))
      .returning();
    return capsule;
  }

  async addCapsuleRecipients(recipientsData: InsertCapsuleRecipient[]): Promise<CapsuleRecipient[]> {
    const recipients = await db.insert(capsuleRecipients).values(recipientsData).returning();
    return recipients;
  }

  async getCapsuleRecipients(capsuleId: string): Promise<CapsuleRecipient[]> {
    return await db
      .select()
      .from(capsuleRecipients)
      .where(eq(capsuleRecipients.capsuleId, capsuleId));
  }

  async markRecipientAsDelivered(recipientId: string): Promise<CapsuleRecipient> {
    const [recipient] = await db
      .update(capsuleRecipients)
      .set({
        deliveredAt: new Date(),
      })
      .where(eq(capsuleRecipients.id, recipientId))
      .returning();
    return recipient;
  }

  async markRecipientAsViewed(recipientId: string): Promise<CapsuleRecipient> {
    const [recipient] = await db
      .update(capsuleRecipients)
      .set({
        viewedAt: new Date(),
      })
      .where(eq(capsuleRecipients.id, recipientId))
      .returning();
    return recipient;
  }

  async getCapsuleAnalytics(userId: string): Promise<{
    totalCapsules: number;
    deliveredCapsules: number;
    scheduledCapsules: number;
    selfDestructedCapsules: number;
  }> {
    const userCapsules = await db
      .select()
      .from(capsules)
      .where(eq(capsules.userId, userId));

    const totalCapsules = userCapsules.length;
    const deliveredCapsules = userCapsules.filter(c => c.deliveredAt !== null).length;
    const scheduledCapsules = userCapsules.filter(c => c.status === 'scheduled').length;
    const selfDestructedCapsules = userCapsules.filter(c => c.selfDestruct && c.viewedAt !== null).length;

    return {
      totalCapsules,
      deliveredCapsules,
      scheduledCapsules,
      selfDestructedCapsules,
    };
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async updatePaymentStatus(stripePaymentId: string, status: string): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.stripePaymentId, stripePaymentId))
      .returning();
    return payment;
  }
}

export const storage = new DatabaseStorage();
