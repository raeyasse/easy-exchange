# 03 — Architecture

## Stack

| Part | Choice | Why |
|------|--------|-----|
| App | React + TypeScript, built with Vite | Simple, well supported by AI agents |
| Routing | React Router with `HashRouter` | Works on any static host without extra configuration; no 404s on reload |
| Data | Browser `localStorage` | The app is static, with no backend or database |
| Tests | Vitest, trade logic only | Built into the Vite ecosystem; covers the riskiest logic without extra cost |
| Hosting | Vercel, connected to the GitHub repo | Free, builds and deploys automatically on every push; no workflow files needed |

## Folder structure

```
easy-exchange/
├── specs/
├── src/
│   ├── data/        # types, seed data, save/load, trade logic
│   ├── pages/       # one component per page
│   ├── components/  # Header, UserMenu, RecordCard, ...
│   └── App.tsx
└── tests/
```

**One rule:** components never touch `localStorage` directly. All reading and writing goes through `src/data/`, and trade logic lives there as plain functions so it's easy to test.

## Data model

```ts
interface User   { id: string; name: string; city: string; }

interface Record {
  id: string; ownerId: string;
  artist: string; title: string; year?: number;
  condition: 'Mint' | 'Near Mint' | 'Very Good' | 'Good' | 'Poor';
  genre: string; notes?: string; createdAt: string;
}

interface Trade {
  id: string; proposerId: string; recipientId: string;
  offeredRecordIds: string[]; requestedRecordIds: string[];
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
}
```

**Seed data:** the 4 demo users, about 20 records spread across them, and one pending trade from Jordan to Maya, so the Incoming tab isn't empty on first visit.

## Pages

| Path | Page |
|------|------|
| `/` | Browse |
| `/records/new` | New record |
| `/records/:id` | Record detail |
| `/records/:id/edit` | Edit record |
| `/users/:id` | Profile |
| `/trades` | Trades |
| `/trades/new` | Propose trade |

## Deployment

- Hosted on Vercel's free Hobby plan.
- One-time setup: sign in to vercel.com with GitHub, choose **Add New → Project**, select the `easy-exchange` repo, and deploy. Vercel detects Vite automatically.
- Every push to `main` triggers a new build and deploy. No GitHub Actions or workflow files are needed.
- Tests are run locally with `npm test` before pushing.
- Live at `https://easy-exchange.vercel.app` or similar; Vercel shows the exact URL.

## Build order

Build one step per Cursor prompt, and commit after each:

1. Scaffold + deploy an empty page to Vercel
2. Data layer + seed data
3. Feature 1: Demo users
4. Feature 2: Record listings
5. Feature 3: Browse & search
6. Feature 4: Trades
