# FlashBack - Digital Time Capsules

A cypherpunk-styled Progressive Web App for creating encrypted digital time capsules. Send messages to your future self with text, photos, or voice recordings, scheduled for delivery at specific future dates.

## Features

### Core Features
- **Time Capsule Creation** - Create capsules with text, photos, and voice recordings
- **Scheduled Delivery** - Set delivery dates from 3 months to 5 years in the future
- **Email Notifications** - Receive capsules via email when scheduled delivery date arrives
- **PWA Support** - Install as a mobile app with offline capabilities

### Advanced Features
- **Multi-Recipient Capsules** - Send time capsules to multiple recipients
- **Location-Based Triggers** - Attach GPS coordinates and location names
- **Spotify Integration** - Attach currently playing songs with album art and preview links
- **Self-Destruct Mode** - Burn-after-reading option that deletes capsules after viewing
- **Smart Scheduling** - AI analyzes content and suggests optimal delivery dates
- **Reflection Summaries** - AI-generated reflections comparing past and present
- **Personal Time Machine Dashboard** - Analytics, word clouds, sentiment analysis, and timeline

### Subscription Tiers
- **Free** - Basic access
- **3-Year Plan** - $39 for extended capsule storage
- **5-Year Plan** - $79 for maximum storage duration

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS with shadcn/ui components
- React Query (TanStack Query)
- Wouter for routing

### Backend
- Express.js with TypeScript
- PostgreSQL (Neon serverless)
- Drizzle ORM
- Passport.js for authentication

### Integrations
- **Replit Auth** - User authentication via OpenID Connect
- **OpenAI** - GPT-4o-mini for AI features
- **Resend** - Transactional email delivery
- **Stripe** - Payment processing
- **Spotify Web API** - Music integration

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Required API keys (see Environment Variables)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/flashback_chronicle.git
cd flashback_chronicle
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see below)

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Session
SESSION_SECRET=your_session_secret

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# OpenAI (AI Features)
OPENAI_API_KEY=your_openai_api_key
```

**Note:** Additional integrations (Resend, Spotify) are configured via Replit Connectors when deployed on Replit.

## Project Structure

```
flashback_chronicle/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets & PWA files
├── server/                 # Backend Express server
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── scheduler.ts        # Cron job for capsule delivery
│   ├── email.ts            # Email sending service
│   ├── ai.ts               # OpenAI integration
│   └── spotify.ts          # Spotify integration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle ORM schema
└── migrations/             # Database migrations
```

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user

### Capsules
- `GET /api/capsules` - Get user's capsules
- `POST /api/capsules` - Create new capsule
- `DELETE /api/capsules/:id` - Delete capsule

### AI Features
- `POST /api/ai/prompt` - Generate AI writing prompts
- `POST /api/ai/schedule` - AI-suggested delivery date

### Spotify
- `GET /api/spotify/search?q=query` - Search tracks
- `GET /api/spotify/now-playing` - Get currently playing track

### Payments
- `POST /api/payments/create-checkout` - Create Stripe checkout session

## Mobile Responsiveness

All touch targets meet WCAG 2.1 Level AAA accessibility standards with minimum 44x44px touch areas. The app is optimized for mobile devices with:
- Responsive layouts
- Touch-friendly controls
- Proper viewport handling
- PWA installation support

## Security

- All API keys stored as environment variables
- Session-based authentication with secure cookies
- Encrypted capsule content
- HTTPS enforced in production
- No sensitive data in client-side code

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with Replit Agent
