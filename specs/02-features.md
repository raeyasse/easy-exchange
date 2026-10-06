# 02 — Features

Each feature lists its acceptance criteria (AC).

**Testing:** Feature 4 (Trades) ACs get automated tests. Features 1–3 are checked manually in the browser.

---

## Feature 1: Demo users (R1)

A menu in the header shows the active user and lets you switch to any other demo user. Each user has a profile page (`/users/:id`) showing their name, city, and records.

- **AC-1.1** On first visit, Maya (u1) is the active user.
- **AC-1.2** Switching users updates the header and which records count as "mine."
- **AC-1.3** The active user is still selected after a page reload.
- **AC-1.4** A user's profile shows only their records.

---

## Feature 2: Record listings (R2)

| Field | Rules |
|-------|-------|
| Artist | required |
| Album title | required |
| Year | optional, 1900 to this year |
| Condition | required: Mint, Near Mint, Very Good, Good, Poor |
| Genre | required: Rock, Jazz, Hip-Hop, Soul/R&B, Electronic, Pop, Other |
| Notes | optional, max 300 characters |

Records show a colored placeholder square with the artist's initials instead of a photo.

- **AC-2.1** Saving a valid form creates a record owned by the active user.
- **AC-2.2** A missing required field shows an error and does not save.
- **AC-2.3** The owner can edit and delete their records; other users cannot.
- **AC-2.4** A record in a pending trade cannot be edited or deleted.

---

## Feature 3: Browse & search (R3)

The home page shows all records, newest first, with a search box.

- **AC-3.1** All records show on the home page, newest first.
- **AC-3.2** Searching matches artist or album title, ignoring upper/lower case.
- **AC-3.3** The active user's own records are marked "Yours."
- **AC-3.4** No matches shows "No records found."

---

## Feature 4: Trades (R4, R5, R6)

**Proposing:** On someone else's record, click "Propose trade." Pick one or more of their records you want and one or more of yours to offer, then send.

**Responding:** The other user sees it under Incoming and clicks Accept or Decline. The proposer can cancel while it's pending.

**Trade statuses:**

```
pending ──accept──▶ accepted   (records swap owners immediately)
   ├────decline──▶ declined
   └────cancel───▶ cancelled
```

**Trades page** (`/trades`) has three tabs: Incoming, Outgoing, History.

- **AC-4.1** Sending a proposal shows it in the proposer's Outgoing and the recipient's Incoming.
- **AC-4.2** "Send" is disabled until at least one record is picked on each side.
- **AC-4.3** You can't propose a trade on your own record.
- **AC-4.4** Accepting swaps owners: offered records go to the recipient, requested records go to the proposer. The trade moves to History for both.
- **AC-4.5** Declining or cancelling moves the trade to History with no ownership change.
- **AC-4.6** Only the recipient can accept or decline; only the proposer can cancel.
