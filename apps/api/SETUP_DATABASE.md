# Quick Database Setup Guide

## 1. Get Neon Database (2 minutes)

1. Go to: https://neon.tech
2. Sign up with GitHub (fastest way)
3. Click "Create Project"
4. Name it: `drivetosurvive`
5. Copy the connection string (looks like: `postgresql://user:pass@host/db?sslmode=require`)

## 2. Set up Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste your Neon connection string
   - **Environment**: Production, Preview, Development (select all)
3. Click "Save"

## 3. Run Database Migrations

Once you have the DATABASE_URL, run:

```bash
cd apps/api
export DATABASE_URL="your-neon-connection-string-here"
npx prisma migrate deploy
```

Or for local development, create `.env` file:
```
DATABASE_URL="your-neon-connection-string-here"
```

Then run:
```bash
npx prisma migrate deploy
npx prisma generate
```

## 4. Seed Database (Optional)

```bash
npm run seed:mock
```

## That's it! 🎉

The next Vercel deployment will automatically:
- Generate Prisma Client
- Connect to your database
- Everything will work!

