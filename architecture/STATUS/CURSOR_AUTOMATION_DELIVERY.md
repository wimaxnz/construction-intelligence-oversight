# Cursor Automation delivery — setup evidence

**Date:** 2026-07-25  
**Repo:** `wimaxnz/construction-intelligence-oversight`  
**Canonical branch:** `main`

## Proven locally

| Check | Result |
|-------|--------|
| Architecture Office merged into `main` | Done (merge commit on local `main`; push required) |
| `node scripts/architecture-office-guard.mjs` | PASS |
| Path-filtered dispatch workflow present | `.github/workflows/architecture-office-dispatch.yml` |
| Cloud agent hooks / skill present | `.cursor/hooks.json`, `.cursor/skills/architecture-office-workpackage/` |
| CCC git remotes | **None configured** — owner-only if CCC cloud delivery URL required |

## Automation (Cursor)

| Field | Value |
|-------|-------|
| Name | Architecture Office Work Package Delivery |
| Trigger | Incoming HTTP webhook (path filter via GitHub Actions) |
| Checkout | `wimaxnz/construction-intelligence-oversight` @ `main` |
| Path filter | GH Actions `paths: ['architecture/NEXT_WORKPACKAGE.md']` → POST webhook |

## Owner-only remaining

1. Save the Cursor Automation from the Automations editor (webhook URL generated after save).
2. Add repo secret `CURSOR_AO_WEBHOOK_URL` (and optional `CURSOR_AO_WEBHOOK_SECRET`) on the oversight GitHub repo.
3. Optional smoke: edit `architecture/NEXT_WORKPACKAGE.md` on `main` (or `workflow_dispatch`) and confirm Automation run + guard PASS.
4. If CCC packages need cloud clone: add the real CCC GitHub remote to the local CCC workspace only when known — do not invent.

## Non-interruption

CCC CIP / ITP / production engineering was not paused. No CIP floor packs modified. Oversight-only delivery wiring.
