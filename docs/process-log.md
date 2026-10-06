# Process Log

A record of how Easy Exchange was built: the tools, prompts, decisions and what changed along the way.

**Tools used:** Claude chat (planning, specs, troubleshooting), Cursor Agent (first build steps), Claude Code inside Cursor (rest of the build), Vercel (hosting).

---

## 1. Studied Cursor Skills
**Tool:** Cursor docs (cursor.com/docs/skills)

**What I learned:**
- A skill is a folder with a `SKILL.md` file in `.cursor/skills/`.
- The agent uses a skill automatically based on its description, or I run it with `/skill-name`.
- A skill run with `/` applies to that one message only.
- Cursor has built-in skills, such as `/create-skill` and `/review`.
- Cursor also reads skills from `.claude/skills/`, because skills follow an open standard.

## 2. Planning (outside Cursor)
**Tool:** Claude chat

**Why Claude for this step:** to save Cursor's limited free usage for the actual building.

**Decisions:**
- **What to exchange:** vinyl records.
- **Hosting:** a free static site, so there's no backend.
- **Data:** stored in each visitor's browser (localStorage).
- **Accounts:** four demo users to switch between, instead of real logins.
- **Scope:** a small MVP with demo users, listings, browse and search, and trades.

**Trade-off:** data isn't shared between devices. That's acceptable for a class demo.

## 3. First spec draft, then trimming it
**Tool:** Claude chat

**First draft:** 9 spec files with 34 acceptance criteria, written like a production app.

**Decision:** it was overbuilt, so I trimmed it to 3 files with 18 acceptance criteria. I cut:
- performance targets
- auto-cancelling rival offers
- a separate "complete" step for trades
- search filters
- a long list of edge cases

Accepting a trade now swaps the records immediately.

**Why:** every line in a spec becomes something the agent builds and I have to explain.

**Finding:** Cursor has no required format or folder for specs. They're Markdown files in `specs/`, referenced in prompts with `@specs/...`.

## 4. Testing scope
**Decision:**
- Automated tests (Vitest) cover only the trade logic.
- Forms, search and the user menu are checked by hand, using checklists the agent writes.

**Why:**
- Tests cost agent usage.
- Trade logic is the riskiest part and the hardest to check by clicking.

I updated R9 in `01-overview.md`, plus `02-features.md` and `03-architecture.md`, so the specs agree.

## 5. Repo setup
**What happened:**
1. I created the local folder and the GitHub repo separately, then linked them. The local folder showed "No commits yet," because linking doesn't download anything.
2. I ran `git pull origin main` to get GitHub's README.
3. The first push failed with "no upstream branch." `git push -u origin main` fixed it.

**Lesson:** next time, create the repo on GitHub and `git clone` it. That downloads and links in one step.

## 6. Skills
**Native skill: `spec-first`**, made with Cursor's built-in `/create-skill`. I wrote a plain-language prompt, and Cursor generated the `SKILL.md`. It tells the agent to:
- read the spec before coding
- ask about anything unclear
- build only what's in scope
- test only the trade logic
- report which acceptance criteria are done

**Imported skill: `frontend-design`**, from Anthropic's public skills repo (github.com/anthropics/skills). I downloaded it into the skills folder.

**Considered and rejected: Vercel's `react-best-practices`.** It's about performance tuning that a small app doesn't need, and it adds context the agent has to read.

**Why use a skill instead of just mentioning the spec:** the spec says *what* to build and changes every feature. The skill says *how* to work and stays the same, so I only write it once.

## 7. Hosting decision
**Options I considered:**
- **GitHub Pages:** needs a GitHub Actions workflow to build the app.
- **Building by hand:** works, but the site only updates when I remember to deploy.
- **Vercel:** connects to the repo and rebuilds on every push.

**Decision:** Vercel, because it needs no workflow files. I updated `01-overview.md` and `03-architecture.md` before building.

**Clarification:** Vercel only serves files. There's still no backend, and all the logic runs in the browser.

## 8. Design approach
**Decision:** prototype the look first and write the design spec afterward.

**Why:** the logic needed exact specs up front, but a look is easier to judge by seeing it. I just said "clean and minimal" in the prompts and let the `frontend-design` skill choose.

## 9. Building in Cursor
**Prompt strategy:** I planned 13 prompts, then merged them into 4 to fit the free tier. Each prompt:
- starts with `/spec-first`
- cites the spec file
- says what not to build
- names the acceptance criteria that define "done"
- asks for a manual checklist

**Prompt 1 (scaffold and data layer):** the skill made the agent ask before guessing.
- *Agent:* the architecture lists 7 pages, but you said no features yet. How should routing work?
- *Me:* the home route only for now; each page arrives with its feature.

**Prompt 2 (demo users, listings, browse):**
- *Agent:* the spec doesn't say what goes in the header.
- *Me:* the app name links home, plus a "List a record" link and the user menu.

## 10. Hit Cursor's free usage limit
**What happened:** Cursor's free tier ran out partway through prompt 2, with about 2,700 lines written but not committed.

**What I did:**
1. Committed everything right away so nothing was lost.
2. Considered my options: email the instructor, upgrade Cursor, or use another agent.
3. Installed Claude Code (covered by my Claude Pro plan) and ran it from the terminal inside Cursor.
4. Moved the skills from `.cursor/skills/` to `.claude/skills/`. Both tools read that folder, so there's one copy of each skill.

**First prompt to Claude Code:** an audit only, with no changes. It reported that:
- steps 1 and 2 were done
- features 1 to 3 had their logic written but weren't connected to the screen
- trades hadn't been started

**Finding:** because the specs and skills were files in the repo, the new agent picked up exactly where Cursor stopped. Switching agents cost almost nothing.

## 11. Finished the features (Claude Code)
**Prompt:** finish Features 1 to 3, reusing what's already written. Connect the header and provider, add the profile and record pages, build the home page, and fix the README (it still said GitHub Pages).

**Result:** I went through the agent's manual checklist in the browser, then committed.

## 12. Trades (Claude Code)
**Prompt:** build Feature 4 with the trade logic in `src/data/`, plus Vitest tests for AC-4.1 to AC-4.6.

**Result:** 16 of 16 tests passed. The type check, lint and build were clean.

**The agent flagged a real gap:** what happens when one record is in two pending trades and one of them is accepted?

**Options:**
- keep the error that appears on the second accept
- auto-cancel the other trade
- block the record upfront

**Decision:** block it. A record in a pending trade can't be picked for a new proposal.

**Spec first:** the rule was added to the spec as **AC-4.7**, with 3 new tests, for 19 tests in total.

## 13. Deployed to Vercel
Imported the repo on vercel.com. Vercel detected Vite and filled in the build settings (`npm run build`, the `dist` folder), so I left the defaults and deployed.

**Live at:** [your-app].vercel.app

## 14. Album covers
**Goal:** replace the colored placeholder squares with real album covers.

**Spec first:**
- Removed "photos" from out of scope in `01-overview.md`.
- Wrote `specs/04-design.md`, covering only the covers and a header fix (the user's name showed twice).
- Left out any look or style rules on purpose, so the agent wouldn't override a design I already liked.

**Implementation:**
- Covers come from the iTunes Search API, searched by artist and album.
- Results are cached in the browser.
- The colored initials remain as the fallback.

## 15. Presentation
**Tool:** Claude (slide deck)

**How it developed:**
1. The first draft had 15 slides.
2. I restyled it to academic standards: action titles, readable text, conclusions and references at the end.
3. I trimmed it to 10 slides, moving details into the speaker notes.
4. I gave it a vinyl "Side A / Side B" theme to match the app.

---

## Key takeaways
1. **Plan where it's free.** Spend agent usage on building.
2. **Keep specs small.** Acceptance criteria define "done."
3. **Put working rules in a skill**, written once and reused.
4. **Treat the agent's questions as a spec review.** They revealed real gaps.
5. **Keep everything as files in the repo.** It made switching agents nearly free.
6. **Update the spec before the code**, even for late changes.
