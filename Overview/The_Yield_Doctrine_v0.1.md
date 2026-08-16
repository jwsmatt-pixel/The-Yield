# The Yield — Project Doctrine v0.1

*16 August 2026 · renamed from Group Cost Normaliser (GCN) 17 August 2026*

## Why this document exists

The Yield and SaveBuddy are different products solving structurally similar problems: turn messy real-world evidence into a financial conclusion someone will act on, without ever claiming more certainty than the evidence supports. Several rules below were independently discovered by The Yield before this document existed — a real supplier-data trial, the discarded outlier detector, the refusal to guess at Inventory Group meanings. This document exists to name those rules on purpose, so they survive past the person who currently holds them in their head, and to draw an explicit line around what The Yield does *not* need to borrow from a harder problem than the one it's solving.

**The thesis, unchanged since v0.1 of the product itself:**

> Prediction proposes the pack. Structured data defines the pack. Deterministic maths determines the cost. Human verification establishes trust.

---

## The hierarchy

```
SUPPLIER SOURCE EVIDENCE  (immutable — exactly as imported)
        ↓
SUPPLIER PRODUCT IDENTITY  (Supplier + SKU)
        ↓
   ┌────────────────┴────────────────┐
   ↓                                  ↓
PACK INTERPRETATION            PRODUCT COMPARABILITY
Verified / Predicted /         Verified / Predicted /
Unresolved                     Unresolved  (pairwise —
        ↓                       a relationship between
CANONICAL QUANTITY              two specific products,
(deterministic — not            not a property of one)
 a claim, just arithmetic)             │
        ↓                              │
NORMALISED UNIT ECONOMICS  ←───────────┘
($ ÷ canonical qty — deterministic)
        ↓
COMPARISON ELIGIBILITY
(derived at read-time, never stored — see Rule 4)
        ↓
SUPPLIER RANKING
        ↓
OPPORTUNITY
   ┌──────────────┴──────────────┐
   ↓                              ↓
CONFIDENCE                    SCOPE
Verified / Indicative         Unit-cost only, or
(are the inputs trusted?)     Annualised
                               (only when usage exists)
```

Two independent axes at the bottom — Confidence and Scope — because "do I trust this number" and "do I have enough volume to annualise it" are different questions with different honest answers. Collapsing them into one "Estimated" label was the mistake to avoid. **Built since this was written**: both axes are now live in the product, not just theory — the annual-saving hero card shows a Verified/Indicative badge (Confidence) independently of whether it's showing a unit-cost differential or an annualised dollar figure (Scope), and the Compare summary strip reports Verified and Indicative opportunity as two separate totals rather than one blended number.

---

## The twelve rules

**1. Preserve supplier source evidence exactly as received.**
Interpretation lives beside it, never overwrites it. `CHK BRST 2X5KG` stays visible even after it resolves to `2 × 5kg = 10kg`.

**2. Prediction proposes structure. Deterministic code performs all economic calculation.**
The parser may say "this probably means 2 × 5kg." It is never asked what something costs per kilo. That arithmetic has no business being a guess. **Held under real pressure since**: the annual-saving derivation (period quantity × annualisation factor × pack size) is entirely arithmetic too — the only thing requiring a human decision is what the raw quantity number *represents* (packs vs. an already-canonical total), never how to calculate from it once that's known.

**3. Pack Interpretation and Product Comparability are independent claims.**
Each carries its own Verified / Predicted / Unresolved status. A product can be pack-verified and comparison-unresolved, or the reverse — those are different commercial situations and the interface should be able to say so.

**4. Comparison eligibility is derived, never stored.**
A row is eligible to rank only when no required claim is Unresolved and it hasn't been explicitly Excluded. No persisted `eligible = true` flag, no `HOLD` state to keep in sync — the underlying claims already say why a row isn't ready. Annual volume follows the same discipline: when it's period-derived, the canonical figure is recomputed fresh from the stored period quantity and the current baseline's pack every time, never cached — a later pack correction is reflected immediately rather than leaving a stale annual number sitting around.

**5. Excluded is a distinct state from Unresolved.**
Excluded means "understood, and deliberately not a product line" — freight, fuel levy, rebate adjustments. Unresolved means "don't yet know." Conflating them lets a mis-parsed freight line quietly rank against real chicken breast.

**6. Product comparability is a relationship between two specific products, not a property of one product or its group label.**
Verifying Supplier A's Chicken Breast ≈ Supplier B's Chicken Breast says nothing about whether Supplier C's belongs in the same set. Comparability is pairwise; group membership is what emerges from a cluster of confirmed pairs, not the source of truth itself.

**7. Verified knowledge is scoped to exactly what the evidence proves.**
Pack structure verification is scoped to Supplier + SKU. Comparability verification is scoped to the specific product pair. A correction made on one exceptional row is a row-level exception until someone deliberately promotes it to a durable rule — it never silently becomes one just because it was typed into an edit box. Batch verify respects this exactly: it only confirms rows already sitting at Predicted status, and only within whatever the person is currently looking at (a filtered list, or the Unverified Predictions queue) — never a hidden "verify everything" sweep.

**8. New source evidence may challenge existing verified knowledge — but only the claim it actually bears on.**
A price-only change never invalidates a verified pack structure; recalculate and move on. *Current provisional position, not yet battle-tested:* a structural pack change (`2×5kg` → `4×2.5kg`, same 10kg total) does challenge the verification, even though the canonical quantity didn't move — a restructured carton can correlate with an unstated specification change. Revisit this if it turns out to generate more review noise than real catches.

**9. Re-import is reconciliation, not append.**
Every import proposes changes against what's already known (Prepare), states plainly what it thinks changed and why (Compare), and only then writes anything (Commit) — atomically, or not at all. Still the most imminent piece of real debt in the current build. A related gap was found and closed in the meantime: import used to silently pick whichever "current supplier" row was processed last when a group had more than one candidate flagged. It now refuses to guess — a group with multiple candidates surfaces as a Review item instead. That's the same principle as reconciliation, applied narrowly, ahead of the full rebuild.

**10. Absence from an import is not evidence of discontinuation.**
A SKU missing from a new "most common — last 3 months" report means "not observed in this sample," nothing more. Never auto-discontinue a product because a periodic report didn't happen to include it.

**11. Diagnostics may challenge a rule; they never bypass it.**
Any secondary check — an outlier flag, a "this looks similar to Chicken Breast" suggestion — surfaces something for a human to look at. It never silently reclassifies or ranks a row on its own authority. Already validated in practice: the statistical outlier detector was built, tested against real data, found to cry wolf, and discarded rather than shipped with a caveat.

**12. Commercial attractiveness cannot validate upstream interpretation.**
A supplier coming out cheap is never evidence that its pack was parsed correctly. Truth flows one way — from source evidence toward the recommendation — never backward from a nice-looking number to "so the parsing must have been right." The same discipline now governs annual-volume import: a column auto-detected as revenue or spend-sounding text is never treated as usage evidence, even when the header contains words like "annual" — usage must be mapped deliberately, never inferred from a plausible-looking name.

---

## Explicitly deferred at v0.1

Named on purpose, so they don't get quietly reinvented worse later, and so nobody mistakes their absence for an oversight:

- **Multi-axis confidence matrix** (Support/Contradict/Block/Establish evidence polarities). The Yield's evidence is almost always single-source — one string of pack text. There's nothing to adjudicate between yet.
- **DIRECT/DERIVED/EXCLUDE/HOLD permission across multiple analytical questions.** The Yield has exactly one downstream question — comparison eligibility — not several competing ones.
- **Realised Saving tracking** (measuring whether a purchasing decision actually changed and produced a measurable reduction). Requires longitudinal import history The Yield doesn't have yet; belongs with reconciliation (Rule 9) once that exists, not before.
- **A formal `ProductEquivalenceRelationship` graph data structure.** The *pairwise* principle (Rule 6) is adopted now. Building and storing the actual relationship graph waits until there are routinely two-or-more suppliers being compared. **Worth flagging**: that trigger condition is now closer to being met than it was — a synthetic multi-supplier stress test has since demonstrated routine two-and-more-supplier comparison working correctly at scale. Still not built, and shouldn't be built reactively off a synthetic test alone, but the "wait for real usage to justify it" bar is measurably closer than it was at v0.1.
- **Five-tier learned-vocabulary scoping** (global / supplier / SKU / relationship / row). Two scopes cover everything currently needed: Supplier+SKU for pack, product-pair for comparability.
- **Ownership Boundary / Financial Position analogs.** No structural equivalent exists in cost normalisation — nothing here to import.

---

## Since this was written

A short, honest log — not a changelog, just the moments the doctrine was actually tested against real building rather than just read:

- The Confidence/Scope split (see hierarchy) went from a design decision to a shipped, tested feature — including the safeguard against a subtle real trap: a raw import quantity can mean "packs already purchased" or "a raw base total," and treating one as the other silently misstates cost by whatever the pack size is. The fix was making the choice explicit, never inferred — Rule 12 in miniature.
- Rule 9's reconciliation gap produced a real, findable symptom before the full rebuild happened: multiple rows flagged "current supplier" in one import were being resolved by processing order. Fixed narrowly, consistent with the rule, without building the larger reconciliation system yet.
- Rule 11 got a second, smaller confirmation: batch verify — approving many Predicted rows in one action — required an explicit confirmation step naming the exact count before doing anything, the same "diagnostics propose, humans decide" instinct as the outlier detector, just applied to a bulk human-initiated action instead of a machine-initiated suggestion.

---

## How to use this document

When a design decision comes up, check it against the twelve rules before checking it against convenience. When a rule turns out to be wrong in practice — not hypothetically wrong, actually-happened wrong — record the real incident next to it, the way SaveBuddy's v0.3.4 timing-audit failure earned its place in that project's doctrine. Don't manufacture a story to fill a gap; an honestly-empty "not yet demonstrated" is worth more than a forced example.
