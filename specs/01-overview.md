# 01 — Overview & Requirements

## What it is

**Easy Exchange** is a web app where vinyl collectors list records they're willing to trade, browse other collectors' records, and propose swaps. No money changes hands.

## Why

Collectors have records they never play and want records others have. Selling and re-buying loses money; trading directly doesn't.

## Users

The app has no real sign-in. It ships with four **demo users**, and the visitor switches between them from a menu in the header. This also makes it easy to demo a full trade by playing both sides.

| id | name | city |
|----|------|------|
| u1 | Maya Chen | Charlotte, NC |
| u2 | Jordan Brooks | Atlanta, GA |
| u3 | Sam Okafor | Raleigh, NC |
| u4 | Lena Fischer | Richmond, VA |

## Requirements

- **R1** Switch between demo users; the choice is remembered after reload.
- **R2** List a record for trade; edit or delete your own listings.
- **R3** Browse all records and search by artist or album.
- **R4** Propose a trade: pick records you want from another user and records you offer.
- **R5** The other user accepts or declines; accepting swaps ownership of the records.
- **R6** See your incoming, outgoing, and past trades.
- **R7** Data is saved in the browser and survives reloads.
- **R8** Deploys to Vercel automatically on every push and works on phone and desktop.
- **R9** Trade logic has automated tests; everything else is checked manually.

## Out of scope

Real accounts, shared data between devices, messaging, ratings, payments, shipping. Do not build these.
