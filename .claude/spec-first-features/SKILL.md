---
name: spec-first-features
description: Builds app features from markdown specs in /specs instead of guessing. Use when implementing a feature, adding UI or trade flows, writing tests, or when the user mentions a spec, /specs, acceptance criteria, or building from a spec.
---

# Spec-first features

Build from `/specs`. Do not invent behavior.

## Before coding

1. Find the relevant spec in `/specs` (match the feature name the user gave). If none exists, stop and ask which spec to use or whether to write one first.
2. Read the whole spec.
3. Ask about anything unclear (missing rules, conflicting AC, unnamed edge cases, unclear copy or data). Do not start coding until those answers are in.
4. Only build what's in the spec. No extra screens, fields, or “nice to have” behavior.

## Tests

- Only write tests for the trade logic (swap/propose/accept/reject rules, matching, and trade state).
- For everything else, give a quick checklist to test by hand. Do not add unit/e2e tests for listing, search, browse, or layout unless the spec’s trade logic requires them.

## When done

Tell me which acceptance criteria you finished. Quote or paraphrase each AC from the spec and mark it done or not done, with a one-line reason if not done.

## Spec shape

Expect specs under `/specs` with a goal, scope/out of scope, and acceptance criteria. If a spec is missing AC, ask before building.
