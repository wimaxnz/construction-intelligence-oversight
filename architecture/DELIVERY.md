# Architecture Office → Cursor delivery

**Canonical branch:** `main` (Architecture Office is merged; do not keep long-term `architecture/office-governance`).

## Trigger path (path-filtered)

Cursor Automations native git push triggers are **branch-level**. File-path precision uses existing GitHub Actions:

| Piece | Role |
|-------|------|
| `.github/workflows/architecture-office-dispatch.yml` | Fires only when `architecture/NEXT_WORKPACKAGE.md` changes on `main` (or manual `workflow_dispatch`) |
| Repo secret `CURSOR_AO_WEBHOOK_URL` | Cursor Automation webhook URL (owner pastes after save) |
| Optional `CURSOR_AO_WEBHOOK_SECRET` | Bearer token if Automation requires auth |
| Cursor Automation | Webhook trigger; checks out oversight `main`; runs work-package skill |

Documentation-only commits that do not touch `NEXT_WORKPACKAGE.md` do **not** dispatch.

## Agent contract

See `.cursor/skills/architecture-office-workpackage/SKILL.md` and `.cursor/hooks.json` (sessionStart guard context).

1. `node scripts/architecture-office-guard.mjs` — fail closed  
2. Execute only `approved` packages  
3. Archive → `WORKPACKAGES/`, review → `REVIEWS/`, update `ARCHITECTURE_STATE.json`  
4. Advance next or queued sentinel  
5. Never interrupt CIP/ITP; CCC work via PR only  

## CCC remote

Delivery packages that need a CCC cloud checkout require a known GitHub remote on the private delivery clone. **Do not invent remotes.** If unset, oversight-only packages still run; CCC-touching packages record owner-only remote setup in the review.
