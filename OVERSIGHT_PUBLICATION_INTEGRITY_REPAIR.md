# Oversight Publication Integrity Repair (High governance)

**Repair run:** 2026-07-11T06:21:09.337Z  
**Severity:** High governance  
**Public repo:** wimaxnz/construction-intelligence-oversight

## Root causes
1. Unauthenticated GitHub Contents API hit **rate limit 403** → `publicStateJsonParsePassed=false` (`jsonParseExit=1` on github-api route).
2. `git show` via `execSync` used default **maxBuffer 1MB** while STATE is ~2.8MB → git-origin route failed silently.

## Fixes applied
- `oversight-state-verify-routes.ts`: Authorization bearer from `GITHUB_TOKEN`/`GH_TOKEN`; `maxBuffer=32MB` for git show/fetch.
- Reconciled `AI_OVERSIGHT_STATE.json`, `AI_OVERSIGHT_REQUEST.md`, `AI_OVERSIGHT_RESPONSE.md`, `OVERSIGHT_PACKET.md` into oversight clone and pushed.
- `write_audit_entry` security interrupt kept **`open_interrupt`** (no completionEvidence) until production deploy + negative security tests + evidence.

## Triple-route proof

| Route | HTTP | Bytes | SHA256 (LF-normalized) | JSON parse |
|-------|------|-------|------------------------|------------|
| github-api | 200 | 2883268 | `2127a16445b889b829ec75387b221fbc2d054e586c108dc442d747e0b7383b90` | exit 0 |
| raw-cdn | 200 | 2876920 | `016df41815c1e46bbe32c824bc29a4da8014f0a16f9894cfa97e398b810c6640` | exit 0 |
| git-origin | 0 | 2883268 | `2127a16445b889b829ec75387b221fbc2d054e586c108dc442d747e0b7383b90` | exit 0 |

- **routeHashesMatch:** false
- **classification:** `cdn-lag-api-git-agree`
- **API ↔ git identity:** true
- **Authoritative content SHA256:** `2127a16445b889b829ec75387b221fbc2d054e586c108dc442d747e0b7383b90`
- **Remote HEAD:** `06a515008f900048e892d83f9b08c513266934a3`
- **publicStateJsonParsePassed:** true
- **CDN stale (documented):** true

## Sprint / milestone confirmation
- **currentSprint:** {"number":895,"status":"closed","previousClosed":894,"closedDate":"2026-07-11"}
- **nextSprint:** 896 — Milestone 920–929 AI-assisted import review foundation — sprint-896-selftest.ts
- **currentMilestone:** 910-919 status=closed wrapComplete=true
- **milestoneProgress:** {"sprintsInMilestone":10,"sprintsClosed":10,"percentComplete":100,"nextWrapReviewSprint":895,"milestoneWrapComplete":true}

## write_audit_entry
Disposition remains **open_interrupt** / high-data-integrity until production deployment, negative security tests, and completionEvidence are recorded.
