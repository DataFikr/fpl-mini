# FPL League Hub - Production Deployment Guide

## Prerequisites

### 1. Database Setup
- Set up a PostgreSQL database (local or cloud)
- Create a database named `fpl_league_hub`
- Obtain the connection URL in format: `postgresql://username:password@host:port/database`

### 2. Redis Setup (Optional)
- Set up Redis instance (local or cloud like Redis Cloud, Upstash)
- Obtain Redis URL in format: `redis://host:port` or `redis://username:password@host:port`
- **Note**: If Redis is not available, the app will use memory cache fallback

## Environment Variables

### Required Variables
Copy `.env.example` to `.env` and update:

```bash
# Database (Required)
DATABASE_URL="postgresql://username:password@host:port/fpl_league_hub"

# FPL API (Optional - has defaults)
FPL_API_BASE_URL="https://fantasy.premierleague.com/api"

# Redis (Optional - will use memory cache if not provided)
REDIS_URL="redis://host:port"

# Environment
NODE_ENV="production"
```

## Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Database Migration
```bash
npx prisma generate
npx prisma db push
```

### 3. Start Production Server
```bash
npm start
```

## Platform-Specific Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `REDIS_URL` (optional)
3. Deploy automatically on push

**Important**: Vercel requires external database (PostgreSQL) and Redis service

### Docker Deployment
1. Create `docker-compose.yml` with PostgreSQL and Redis
2. Update `.env` with Docker service names
3. Run: `docker-compose up -d`

### Railway/Render Deployment
1. Connect GitHub repository
2. Add PostgreSQL and Redis add-ons
3. Set environment variables from add-on credentials
4. Deploy

## Database Schema Changes

When updating the database schema:

1. Update `prisma/schema.prisma`
2. Generate migration:
   ```bash
   npx prisma db push
   ```
3. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

## Performance Optimization

### Redis Caching
- FPL API responses are cached for 5-30 minutes
- Without Redis, uses memory cache (single instance only)

### Database Connection Pooling
- Prisma handles connection pooling automatically
- For high traffic, consider external connection pooler

### Team Crest Generation
- Team crests are generated locally using SVG graphics
- No external API dependencies or costs
- Crests are cached in database to avoid regeneration
- Customizable colors and designs based on team names

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL format
- Check network connectivity
- Ensure database exists and user has permissions

### Redis Connection Issues
- App will fall back to memory cache
- Check Redis URL format and connectivity
- Monitor console warnings

### Build Errors
- Run `npm run build` locally first
- Check TypeScript errors: `npm run type-check`
- Verify all environment variables are set

### Performance Issues
- Monitor Redis connection
- Check database query performance
- Consider implementing request throttling for FPL API

## Security Considerations

- Never commit `.env` files to version control
- Use strong database passwords
- Enable SSL for production databases
- Monitor API rate limits
- Consider implementing CORS policies

## Monitoring

### Health Checks
- Database connectivity: Check Prisma client connection
- Redis connectivity: Monitor cache hit/miss ratios
- FPL API status: Monitor response times and errors

### Logging
- Production logs include only errors (not queries)
- Monitor console warnings for Redis fallbacks
- Track FPL API rate limiting

## Support

For deployment issues:
1. Check console logs for specific error messages
2. Verify all environment variables are set correctly
3. Test database and Redis connections independently
4. Ensure all dependencies are installed with `npm ci`