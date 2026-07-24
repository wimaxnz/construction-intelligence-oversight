---
name: architecture-office-workpackage
description: >-
  Execute an approved Architecture Office work package from
  architecture/NEXT_WORKPACKAGE.md. Use when a Cursor Automation or agent
  is delivering Architecture Office packages on oversight main.
---

# Architecture Office work-package execution

## Hard rules

1. Work primarily in `construction-intelligence-oversight` on **`main`**.
2. **Do not interrupt** active CCC CIP / ITP / production engineering. Never force-push CCC branches; open PRs for any CCC delivery edits.
3. Fail closed on guard failure — do not publish or archive.
4. Execute **only** packages with status `approved` (or continue `in_progress`). Queued / none / draft → clean no-op abort.
5. Auto-delivery covers **all approved CIP engineering work packages**, not oversight-only reviews.

## Procedure

1. Checkout oversight `main` (latest).
2. Run `node scripts/architecture-office-guard.mjs` — exit non-zero ⇒ stop.
3. Parse `architecture/NEXT_WORKPACKAGE.md` + `architecture/ARCHITECTURE_STATE.json`.
4. If not approved / no pending package → abort cleanly; no commits.
5. If approved:
   - Prefer oversight-only edits when the package is governance/checkpoint.
   - For CCC engineering: sibling path `../construction-command-centre` if present; otherwise use the known GitHub remote **only if configured**. If CCC has no remote and the package requires CCC code, write the review noting **owner-only CCC remote** and complete oversight artefacts without thrashing CIP.
   - Open a PR for CCC delivery work; do not fight in-flight CIP commits.
6. On completion:
   - Move package body to `architecture/WORKPACKAGES/<id>-<slug>.md` with status `completed`.
   - Write `architecture/REVIEWS/<review-id>-<slug>.md` (PASS/FAIL).
   - Update `architecture/ARCHITECTURE_STATE.json` (`completedWorkPackages`, `completedReviews`, `nextWorkPackage`, `lastUpdated`).
   - Set `architecture/NEXT_WORKPACKAGE.md` to the next approved package, or the **queued sentinel** (required sections present; status `queued`; id `AO-WP-NONE` or empty queue id per office convention).
7. Commit and push results to oversight `main` (or open a PR if push is unsafe).
8. If another approved package is already staged as next, continue the same contract; otherwise stop.

## Queued sentinel convention

When no package is ready, `NEXT_WORKPACKAGE.md` must still include all required guard headings, declare **Status:** `queued`, and use package id `AO-WP-NONE`. `ARCHITECTURE_STATE.json` `nextWorkPackage.status` must be `queued`. Automation must treat this as a no-op.

## Non-goals

- Do not create bridge microservices, n8n flows, or extra infra.
- Do not modify CIP floor packs or pause CIP for Architecture Office delivery.
- Do not invent a CCC GitHub remote URL.
