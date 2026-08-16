# The Yield — Project Folder Guide

*Last aligned: 17 August 2026*

## Start here

**Open `html`** — that's the actual app, always sitting at the root of this folder so it's never buried. Double-click it, or drop it into a browser. No install, no server, no account.

Everything else in this folder supports that one file: how it was built, why it works the way it does, how to test it, and what's deliberately not in it yet.

## What's where

| Folder | What it holds | When to open it |
|---|---|---|
| *(root)* | The current app, always named `..._CURRENT.html` | To actually use the tool |
| `Overview/` | Doctrine, Product Brief, Parked Ideas | To understand the philosophy, current state, and what's intentionally not built yet |
| `Testing Kit/` | Testing Guide + five synthetic supplier CSVs | To validate behaviour, or onboard someone new to what the tool should do |
| `Older Versions/` | Every prior build, in order | Only if you need to check when something changed |
| `Older Versions/Design Explorations/` | A Claude Design visual-restyle experiment | Reference for the visual identity direction, not a version of the app itself — different codebase entirely, kept separate so it's never mistaken for a real build in the lineage |

## The one rule that matters

**The file ending in `_CURRENT` at the root is always the only one to trust.** When a new version replaces it:

1. Move the old `_CURRENT` file into `Older Versions/`, rename it to the next version number (zero-padded — `v11`, not `v11` next to a `v9` that would sort wrong alphabetically).
2. Rename the new file to `The-Yield_v{N}_CURRENT.html` and place it at the root.
3. Delete nothing — the version history is the whole point.

If you ever open this folder and see two files with `_CURRENT` in the name, or none, something went wrong in that handoff — go find the real one from the conversation it came from before trusting either.

## Quick map of Overview/

- **Doctrine** — the twelve rules the product is built on, and why. Read this before making a design decision, not after.
- **Product Brief** — what's actually built, in plain terms, current as of its date. Good for onboarding someone new.
- **Parked Ideas** — everything deliberately *not* built, and the real-world signal that would earn each one back onto the roadmap. If you're ever tempted to build something ahead of need, check here first — it's probably already been reasoned about.

## Naming convention going forward

`The-Yield_v{NN}.html` — always two-digit, always hyphenated, always the current brand name. The old `group-cost-normaliser_N.html` pattern is retired as of this alignment pass; historical files were renamed to match rather than left inconsistent, since the version *history* mattering is the whole reason to keep them.
