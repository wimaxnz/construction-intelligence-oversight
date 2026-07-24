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
| Trigger | Incoming HTTP webhook |
| Path filter | GitHub Actions `architecture-office-dispatch.yml` on `architecture/NEXT_WORKPACKAGE.md` @ `main` |
| Checkout | `wimaxnz/construction-intelligence-oversight` @ `main` |
| Editor | Prefill opened in Automations UI (2026-07-25) — owner must **Save** to mint webhook URL |

## Local contract verification

| Step | Result |
|------|--------|
| Guard PASS | Yes |
| Execute approved AO-WP-002 | PASS (oversight-only checkpoint) |
| Archive + REVIEWS + STATE + queued sentinel | Done on `main` |
| CCC CIP undisturbed | Yes (`feature/itp-ci-engine-integration` left alone; no CCC remotes invented) |

## Owner-only remaining

1. In Automations editor: confirm draft → **Save** Automation (creates webhook URL).
2. Add GitHub repo secret `CURSOR_AO_WEBHOOK_URL` (optional `CURSOR_AO_WEBHOOK_SECRET`) on `wimaxnz/construction-intelligence-oversight`.
3. Smoke: `workflow_dispatch` on `architecture-office-dispatch.yml` or a trivial NEXT_WORKPACKAGE touch → confirm Automation run.
4. If CCC packages need cloud clone: add the **known** CCC GitHub remote only — do not invent.

## Non-interruption

CCC CIP / ITP / production engineering was not paused. No CIP floor packs modified.
