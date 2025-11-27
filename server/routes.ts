import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCapsuleSchema, updateCapsuleSchema, insertCapsuleRecipientSchema } from "@shared/schema";
import OpenAI from "openai";
import Stripe from "stripe";
import multer from "multer";
import { z } from "zod";
import { searchTracks, getCurrentlyPlaying } from "./spotify";
import { 
  generatePromptSuggestion, 
  suggestDeliveryDate, 
  generateReflectionSummary,
  generateWordCloud,
  analyzeSentiment
} from "./ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/capsules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const capsules = await storage.getUserCapsules(userId);
      res.json(capsules);
    } catch (error) {
      console.error("Error fetching capsules:", error);
      res.status(500).json({ message: "Failed to fetch capsules" });
    }
  });

  app.get('/api/capsules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const capsule = await storage.getCapsule(id);
      
      if (!capsule) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      
      if (capsule.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(capsule);
    } catch (error) {
      console.error("Error fetching capsule:", error);
      res.status(500).json({ message: "Failed to fetch capsule" });
    }
  });

  app.post('/api/capsules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertCapsuleSchema.parse({
        ...req.body,
        userId,
      });
      
      const capsule = await storage.createCapsule(validated);
      res.json(capsule);
    } catch (error) {
      console.error("Error creating capsule:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create capsule" });
    }
  });

  app.patch('/api/capsules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const capsule = await storage.getCapsule(id);
      
      if (!capsule) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      
      if (capsule.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validated = updateCapsuleSchema.parse(req.body);
      const updated = await storage.updateCapsule(id, validated);
      res.json(updated);
    } catch (error) {
      console.error("Error updating capsule:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update capsule" });
    }
  });

  app.delete('/api/capsules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const capsule = await storage.getCapsule(id);
      
      if (!capsule) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      
      if (capsule.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCapsule(id);
      res.json({ message: "Capsule deleted" });
    } catch (error) {
      console.error("Error deleting capsule:", error);
      res.status(500).json({ message: "Failed to delete capsule" });
    }
  });

  app.post('/api/ai/prompt', isAuthenticated, async (req, res) => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a thoughtful writing assistant helping people create meaningful time capsule messages. Generate a short, inspiring writing prompt (one sentence, max 15 words) that encourages deep reflection."
          },
          {
            role: "user",
            content: "Give me a prompt for a time capsule message."
          }
        ],
        max_tokens: 50,
        temperature: 0.8,
      });

      const prompt = completion.choices[0]?.message?.content?.trim() || "What would you tell your future self?";
      res.json({ prompt });
    } catch (error) {
      console.error("Error generating AI prompt:", error);
      res.status(500).json({ message: "Failed to generate prompt" });
    }
  });

  app.post('/api/ai/reflection', isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a compassionate reflection assistant. Read the user's time capsule message and write a brief, two-sentence reflection that captures the essence and emotion of their message."
          },
          {
            role: "user",
            content: `Time capsule message: "${content}"\n\nWrite a two-sentence reflection:`
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const reflection = completion.choices[0]?.message?.content?.trim() || "";
      res.json({ reflection });
    } catch (error) {
      console.error("Error generating AI reflection:", error);
      res.status(500).json({ message: "Failed to generate reflection" });
    }
  });

  app.post('/api/payments/create-checkout', isAuthenticated, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = req.user.claims.sub;
      
      if (!['3year', '5year'].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      const priceMap: { [key: string]: number } = {
        '3year': 3900,
        '5year': 7900,
      };

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: plan === '3year' ? '3 Year Plan' : '5 Year Plan',
                description: 'FlashBack Premium Time Capsule Access',
              },
              unit_amount: priceMap[plan],
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.hostname}/dashboard?payment=success`,
        cancel_url: `${req.protocol}://${req.hostname}/?payment=cancelled`,
        client_reference_id: userId,
        metadata: {
          userId,
          plan,
        },
      });

      await storage.createPayment({
        userId,
        stripePaymentId: session.id,
        amount: priceMap[plan],
        plan,
        status: 'pending',
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post('/api/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        
        if (userId && plan) {
          const expiresAt = new Date();
          if (plan === '3year') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 3);
          } else if (plan === '5year') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 5);
          }
          
          await storage.updateUserSubscription(userId, plan, expiresAt);
          await storage.updatePaymentStatus(session.id, 'completed');
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  app.get('/api/spotify/search', isAuthenticated, async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const tracks = await searchTracks(q, parseInt(limit as string));
      res.json(tracks);
    } catch (error) {
      console.error("Error searching Spotify tracks:", error);
      res.status(500).json({ message: "Failed to search tracks" });
    }
  });

  app.get('/api/spotify/currently-playing', isAuthenticated, async (req, res) => {
    try {
      const track = await getCurrentlyPlaying();
      res.json(track || { message: "No track currently playing" });
    } catch (error) {
      console.error("Error getting currently playing track:", error);
      res.status(500).json({ message: "Failed to get currently playing track" });
    }
  });

  app.post('/api/ai/suggest-date', isAuthenticated, async (req, res) => {
    try {
      const { content, title } = req.body;
      
      if (!content || !title) {
        return res.status(400).json({ message: "Content and title are required" });
      }

      const suggestion = await suggestDeliveryDate(content, title);
      res.json(suggestion);
    } catch (error) {
      console.error("Error suggesting delivery date:", error);
      res.status(500).json({ message: "Failed to suggest delivery date" });
    }
  });

  app.post('/api/capsules/:id/recipients', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const capsule = await storage.getCapsule(id);
      
      if (!capsule) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      
      if (capsule.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!req.body.recipients || !Array.isArray(req.body.recipients)) {
        return res.status(400).json({ message: "Recipients array is required" });
      }

      const recipientsSchema = z.array(insertCapsuleRecipientSchema);
      const validated = recipientsSchema.parse(req.body.recipients.map((r: any) => ({
        ...r,
        capsuleId: id,
      })));

      const recipients = await storage.addCapsuleRecipients(validated);
      res.json(recipients);
    } catch (error) {
      console.error("Error adding capsule recipients:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add recipients" });
    }
  });

  app.get('/api/capsules/:id/recipients', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const capsule = await storage.getCapsule(id);
      
      if (!capsule) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      
      if (capsule.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const recipients = await storage.getCapsuleRecipients(id);
      res.json(recipients);
    } catch (error) {
      console.error("Error fetching recipients:", error);
      res.status(500).json({ message: "Failed to fetch recipients" });
    }
  });

  app.post('/api/capsules/:id/view', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const capsule = await storage.getCapsule(id);
      
      if (!capsule) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      
      if (capsule.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updated = await storage.markCapsuleAsViewed(id);
      res.json(updated);
    } catch (error) {
      console.error("Error marking capsule as viewed:", error);
      res.status(500).json({ message: "Failed to mark capsule as viewed" });
    }
  });

  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getCapsuleAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/wordcloud', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const capsules = await storage.getUserCapsules(userId);
      const words = await generateWordCloud(capsules);
      res.json({ words });
    } catch (error) {
      console.error("Error generating word cloud:", error);
      res.status(500).json({ message: "Failed to generate word cloud" });
    }
  });

  app.post('/api/analytics/sentiment', isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const sentiment = await analyzeSentiment(content);
      res.json({ sentiment });
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
