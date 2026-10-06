# 03 — Architecture

## Stack

| Part | Choice | Why |
|------|--------|-----|
| App | React + TypeScript, built with Vite | Simple, well supported by AI agents |
| Routing | React Router with `HashRouter` | GitHub Pages can't handle deep links; hash URLs avoid 404s on reload |
| Data | Browser `localStorage` | GitHub Pages has no backend or database |
| Tests | Vitest, trade logic only | Built into the Vite ecosystem; covers the riskiest logic without extra cost |
| Hosting | GitHub Pages via GitHub Actions | Free, deploys on every push to `main` |

## Folder structure

```
easy-exchange/
├── .github/workflows/deploy.yml
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

- `vite.config.ts` sets `base: '/easy-exchange/'`.
- The GitHub Actions workflow runs tests, builds, and deploys to Pages.
- In the repo, go to Settings → Pages → Source and choose **GitHub Actions**.
- Live at `https://<your-username>.github.io/easy-exchange/`.

## Build order

Build one step per Cursor prompt, and commit after each:

1. Scaffold + deploy an empty page to GitHub Pages
2. Data layer + seed data
3. Feature 1: Demo users
4. Feature 2: Record listings
5. Feature 3: Browse & search
6. Feature 4: Trades
