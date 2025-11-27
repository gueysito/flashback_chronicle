import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default('free'),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  capsules: many(capsules),
}));

// Time capsules table
export const capsules = pgTable("capsules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  photoUrl: text("photo_url"),
  voiceUrl: text("voice_url"),
  recipientEmail: varchar("recipient_email"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  deliveredAt: timestamp("delivered_at"),
  status: varchar("status").notNull().default('draft'),
  aiPromptUsed: text("ai_prompt_used"),
  aiReflection: text("ai_reflection"),
  
  // Location-Based Triggers
  latitude: text("latitude"),
  longitude: text("longitude"),
  locationName: text("location_name"),
  deliveryTrigger: varchar("delivery_trigger").default('time'),
  
  // Spotify Integration
  spotifyTrackId: varchar("spotify_track_id"),
  spotifyTrackName: text("spotify_track_name"),
  spotifyArtist: text("spotify_artist"),
  spotifyAlbumArt: text("spotify_album_art"),
  spotifyPreviewUrl: text("spotify_preview_url"),
  
  // Self-Destruct Option
  selfDestruct: boolean("self_destruct").default(false),
  viewedAt: timestamp("viewed_at"),
  
  // Smart Scheduling
  aiSuggestedDate: timestamp("ai_suggested_date"),
  aiSchedulingReason: text("ai_scheduling_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const capsulesRelations = relations(capsules, ({ one, many }) => ({
  user: one(users, {
    fields: [capsules.userId],
    references: [users.id],
  }),
  recipients: many(capsuleRecipients),
}));

// Multi-Recipient Capsules
export const capsuleRecipients = pgTable("capsule_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  capsuleId: varchar("capsule_id").notNull().references(() => capsules.id, { onDelete: 'cascade' }),
  recipientEmail: varchar("recipient_email").notNull(),
  recipientName: varchar("recipient_name"),
  deliveredAt: timestamp("delivered_at"),
  viewedAt: timestamp("viewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const capsuleRecipientsRelations = relations(capsuleRecipients, ({ one }) => ({
  capsule: one(capsules, {
    fields: [capsuleRecipients.capsuleId],
    references: [capsules.id],
  }),
}));

// Payment records table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripePaymentId: varchar("stripe_payment_id").unique(),
  amount: integer("amount").notNull(),
  plan: varchar("plan").notNull(),
  status: varchar("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertCapsuleSchema = createInsertSchema(capsules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deliveredAt: true,
  viewedAt: true,
}).extend({
  scheduledFor: z.coerce.date(),
  aiSuggestedDate: z.coerce.date().optional().nullable(),
});

export const updateCapsuleSchema = createInsertSchema(capsules).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertCapsuleRecipientSchema = createInsertSchema(capsuleRecipients).omit({
  id: true,
  createdAt: true,
  deliveredAt: true,
  viewedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCapsule = z.infer<typeof insertCapsuleSchema>;
export type UpdateCapsule = z.infer<typeof updateCapsuleSchema>;
export type Capsule = typeof capsules.$inferSelect;
export type InsertCapsuleRecipient = z.infer<typeof insertCapsuleRecipientSchema>;
export type CapsuleRecipient = typeof capsuleRecipients.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
