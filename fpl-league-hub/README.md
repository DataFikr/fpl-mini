# FPL League Hub

A comprehensive Fantasy Premier League mini-league analytics platform that provides personalized insights, rank progression tracking, and squad analysis.

## Features

- **Team Search**: Find FPL teams by name with auto-complete
- **League Dashboard**: View mini-league standings and analytics  
- **Rank Progression**: Interactive charts showing position changes over time
- **Squad Analysis**: Detailed player performance and selection analysis
- **Dynamic Team Crests**: Automatically generated SVG team badges with custom colors and designs
- **Mobile Responsive**: Optimized for all device sizes
- **SEO Optimized**: Server-side rendering with structured data

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Charts**: Recharts
- **Graphics**: Dynamic SVG crest generation
- **Deployment**: Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance (optional, falls back to memory cache)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# Redis for caching
REDIS_URL="redis://localhost:6379"

# Note: Crest generation is now handled locally with SVG

# FPL API
FPL_API_BASE_URL="https://fantasy.premierleague.com/api"
```

3. **Set up the database**:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

4. **Start the development server**:
```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.

### Build for Production

```bash
npm run build
npm run start
```

## API Endpoints

- `GET /api/search?q={teamName}` - Search for FPL teams
- `GET /api/teams/{id}` - Get team information and leagues
- `GET /api/teams/{id}/squad?gameweek={gw}` - Get squad analysis
- `GET /api/leagues/{id}?action=sync` - Sync league data from FPL
- `GET /api/leagues/{id}?action=progression` - Get rank progression data
- `GET /api/crests?teamName={name}` - Get team crest
- `POST /api/crests` - Generate new team crest

## Deployment

Deploy easily on Vercel:
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

For database and Redis, consider Supabase and Upstash.
