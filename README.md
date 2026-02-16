# Traka Launchpad

Your central hub for all Traka tools and products. A modern dark-themed web portal where authenticated users can discover, favorite, and launch Traka tools with a single click.

## Quick Start

```bash
# Install dependencies
npm install

# Set up the database (generate client, push schema, seed data)
npm run setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Login

- **Email:** admin@traka.com
- **Password:** admin123

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Auth:** NextAuth.js v5 (Google OAuth + Credentials)
- **Database:** SQLite via Prisma ORM (PostgreSQL-ready)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React

## Features

- **Tool Launchpad** - Responsive grid of tool cards with categories, search, and filtering
- **Favorites** - Pin frequently used tools for quick access
- **Launch Tracking** - Every tool launch is recorded for analytics
- **User Authentication** - Email/password + Google OAuth sign-in
- **Admin Panel:**
  - Tool management (add/edit/remove/reorder tools)
  - User management (roles, enable/disable accounts)
  - Usage analytics with charts
  - Announcements system with banner display

## Database Commands

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed with default data
npm run db:studio     # Open Prisma Studio (visual DB editor)
npm run db:reset      # Reset and re-seed database
```

## Migrating to PostgreSQL

When ready for production deployment:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/traka_launchpad"
   ```

3. Run migrations:
   ```bash
   npm run db:push
   npm run db:seed
   ```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Set authorized redirect URI to `http://localhost:3000/api/auth/callback/google`
4. Add client ID and secret to `.env.local`

## Project Structure

```
src/
├── app/
│   ├── (auth) login, register pages
│   ├── dashboard/ - main launchpad, favorites, profile
│   ├── admin/ - tools, users, analytics, announcements
│   └── api/ - REST endpoints
├── components/ - reusable UI components
├── lib/ - auth config, prisma client, utilities
└── types/ - TypeScript type definitions
```
