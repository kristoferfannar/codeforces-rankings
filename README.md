# Codeforces Viewer

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data

The website displays info about username handles defined in `src/app/api/cron/route.ts`.
Update that list to modify which users you track.

### Persistance

The Codeforces API enforces strict ratelimiting, so while we don't need to persist data, it makes the website load a lot faster.

Information about all users are persisted in a free tier Vercel Edge as its database. I think it has a maximum capacity of 8KB (yes, kilobytes).
This means we're limited to only the most important info on each user. With more storage, I would store more stuff.

All this to say, the current codebase requires a Vercel Edge token to persist and fetch users. You won't see any info without it.

```
EDGE_CONFIG=<edge-config-token-here>
EDGE_ID=<edge-database-id-here>
```

### Updates

The `/api/cron` endpoint queries the codeforces API for updated submissions + scores for all listed users.

This endpoint is aptly named `cron` as it's hit by the Vercel cron service daily.
