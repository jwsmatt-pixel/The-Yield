# The Yield — Claude Code Project Rules

*Claude Code reads this file automatically at the start of every session in this repo.
These rules apply to every task unless a specific task file explicitly overrides one.*

## What this project is

A local-first, single-file HTML/CSS/JS tool that normalizes inconsistent supplier
pack sizes and pricing into genuine like-for-like cost comparisons. See
`Overview/The_Yield_Doctrine_v0.1.md` for the twelve rules the product is built on —
read it before making any design decision, not after.

## Repository boundaries

- This is the only active repo. Do not assume or create a second copy anywhere.
- The live app is always named **`index.html`**, at the repo root, never renamed
  or suffixed — GitHub Pages requires that exact filename to serve the app;
  anything else falls back to rendering the README as the site's homepage
  instead. This is a hard constraint, not a preference.
- **This repo uses two branches: `main` (stable) and `sandbox` (experimental).
  Never work directly on `main`.** If you find yourself on `main` for any task,
  stop and say so rather than proceeding — `run_claude.ps1` already refuses to
  run outside `sandbox`, but if you are ever invoked another way, apply the
  same rule yourself.

## Real data boundary — do not cross this

`Reference Reports/` contains real, anonymized supplier purchasing data — genuine
prices and pack descriptions with only the supplier's identity removed. Treat it
exactly like the real financial data SaveBuddy keeps away from its coding agent:

- **Never read, open, or reference files in `Reference Reports/` for implementation, testing, or example purposes.**
- If a task needs sample data, use `Testing Kit/` instead — five fully synthetic supplier CSVs built for exactly this.
- If you believe a task genuinely requires touching `Reference Reports/`, stop and flag it rather than proceeding.

## Truth and calculation rules (from the Doctrine — do not violate)

- Prediction may propose a pack structure. Deterministic code performs all economic calculation — never ask a model to produce a dollar figure directly.
- A Verified pack override always wins over a fresh parser guess, for that Supplier + SKU, forever.
- Never auto-map an "Annual Volume"-shaped CSV column — it must always be a deliberate human choice (this was a real bug, already fixed once; do not reintroduce it).
- When something is ambiguous, the correct behavior is refusing to guess and routing to Review — not picking the most likely option silently.

## Verification required before any task is considered done

There is no `package.json` in this project — do not add one just to get familiar
tooling; that would be scope creep on a deliberately dependency-free app. Instead:

1. `node --check` against the extracted `<script>` contents of the current app file (syntax must be valid).
2. Run `tools/verify.js` if present (a Playwright smoke test — loads demo data, checks for console errors, confirms the core screens render). If it doesn't exist yet, ask before creating it rather than guessing at scope.
3. `git diff --check` (whitespace/integrity).

A task is not complete until all three pass. A test that could not run (missing
browser binary, sandboxed environment, etc.) is **blocked, not passed** — say so
explicitly rather than reporting success.

## Non-goals (do not build unless explicitly asked)

Anything listed in `Overview/The_Yield_Parked_Ideas.docx` under a section still
tagged PARKED. If a task seems to require one of those, stop and flag it rather
than quietly building it as a side effect of something else.

## Commit discipline

- Do not commit. Stage changes and stop — the human reviews `git diff` and commits manually.
- Never touch `Reference Reports/` in a commit unless a task explicitly instructs it.
- One logical unit of work per commit message, written for a changelog, not "wip".
