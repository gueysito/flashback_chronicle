# FlashBack - Digital Time Capsules

## Overview

FlashBack is a web application that enables users to create encrypted digital time capsules containing text, photos, or voice recordings. These capsules are scheduled for delivery to the user's future self at specific dates (3 months, 1 year, 5 years, etc.). The application features a cypherpunk-inspired design aesthetic with a privacy-first approach and email delivery notifications.

**Core Features:**
- Create time capsules with text, photos, and voice recordings
- Schedule delivery dates for future access
- Email notifications when capsules are delivered
- Subscription-based pricing tiers (free, 3-year, 5-year plans)
- AI-powered prompt suggestions for capsule content
- Progressive Web App (PWA) support with offline capabilities

**New Advanced Features (Recently Added):**
- **Multi-Recipient Capsules**: Send time capsules to multiple recipients with individual delivery tracking
- **Location-Based Triggers**: Attach GPS coordinates and location names to capsules
- **Spotify Music Integration**: Attach currently playing songs to capsules with album art and preview links
- **Self-Destruct Option**: Burn-after-reading mode that automatically deletes capsules after viewing
- **Smart Scheduling with AI**: AI analyzes capsule content and suggests optimal delivery dates with reasoning
- **Reflection Summaries**: AI-generated reflections comparing past and present when capsules are delivered
- **Personal Time Machine Dashboard**: Analytics, word clouds, sentiment analysis, and timeline visualization

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- React Query (TanStack Query) for server state management and data fetching

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library with "new-york" style variant
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**Design System:**
- Cypherpunk/cyberpunk aesthetic with terminal-inspired minimalism
- Monospace fonts (JetBrains Mono, Space Mono) from Google Fonts
- Dark-first color scheme with matrix green (#10b981) as primary brand color
- Custom CSS variables for theming with light/dark mode support

**State Management Approach:**
- Server state managed via React Query with infinite stale time
- Authentication state handled through session-based cookies
- Form state managed with React Hook Form and Zod validation
- Local UI state using React hooks (useState, useEffect)

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for API routes
- ESM module system throughout the codebase
- Middleware-based request handling with session management

**Authentication System:**
- Replit Auth via OpenID Connect (OIDC) integration
- Passport.js strategy for OAuth flow
- Session-based authentication using connect-pg-simple for PostgreSQL session storage
- 7-day session expiry with automatic renewal

**API Design:**
- RESTful endpoints under `/api` namespace
- Authentication middleware (`isAuthenticated`) protecting routes
- JSON request/response format
- Multipart form data support for file uploads (photos, voice recordings)

**Background Jobs:**
- Node-cron scheduler running every 5 minutes
- Checks for scheduled capsules ready for delivery
- Triggers email delivery via Resend service
- Error handling with automatic retry on next cycle

### Data Storage

**Database:**
- PostgreSQL via Neon serverless platform
- Drizzle ORM for type-safe database queries
- WebSocket connection pooling for serverless environment

**Schema Design:**
- `users` table: Stores user profiles, subscription tiers, and expiration dates
- `capsules` table: Time capsule content, scheduling, delivery status, media URLs
- `payments` table: Stripe payment tracking and subscription management
- `sessions` table: Express session storage for authentication

**Data Relationships:**
- One-to-many: Users to Capsules (cascade delete)
- Foreign key constraints with referential integrity
- Timestamp tracking (createdAt, updatedAt, deliveredAt, scheduledFor)

### External Dependencies

**Authentication & Infrastructure:**
- Replit Auth: User authentication and identity management
- Replit Connectors: Secure credential management for third-party services

**Email Service:**
- Resend: Transactional email delivery for capsule notifications
- HTML email templates with capsule content preview
- Dynamic from-email configuration via Replit Connectors

**Payment Processing:**
- Stripe: Subscription payment handling (3-year, 5-year plans)
- Stripe.js and React Stripe.js for frontend checkout integration
- Webhook support for payment status updates

**AI Integration:**
- OpenAI API: GPT-4o-mini for multiple features:
  - Prompt suggestions for capsule content creation
  - Smart scheduling date recommendations with reasoning
  - Reflection summaries comparing past and present
  - Word cloud generation from capsule content
  - Sentiment analysis of capsule messages

**Music Integration:**
- Spotify Web API: Music integration via Replit Spotify connector
  - Search tracks and attach them to capsules
  - Get currently playing track
  - Store track metadata (name, artist, album art, preview URL)
  - OAuth handled automatically by Replit connector

**File Storage:**
- Multer: In-memory file upload handling
- Photo and voice recording storage (implementation pending)

**Progressive Web App:**
- Service Worker for offline caching and background sync
- Web App Manifest for installable app experience
- Cache-first strategy for static assets, network-first for API calls

**Development Tools:**
- Replit-specific plugins: Cartographer, Dev Banner, Runtime Error Modal
- These enhance the development experience within the Replit environment