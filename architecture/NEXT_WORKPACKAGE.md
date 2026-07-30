# NEXT WORK PACKAGE

**Package ID:** `AO-WP-005`  
**Title:** Edge ai-orchestrator redeploy + JWT AGKB hard-promote soak  
**Status:** `owner_gated` (awaiting owner `SUPABASE_ACCESS_TOKEN`)  
**Governing reference:** [`CCC_ARCHITECTURE.md`](./CCC_ARCHITECTURE.md)  
**Machine state:** [`ARCHITECTURE_STATE.json`](./ARCHITECTURE_STATE.json)  
**Canonical oversight:** [`../AI_OVERSIGHT_STATE.json`](../AI_OVERSIGHT_STATE.json)  
**Prior package:** AO-WP-004 ITP CI SPA go-live — **COMPLETED** (CCC PR #7 tip `7ed70612`; stamp `20260730T032754Z-itp-ci-engine`)

> Production-readiness parallel stream. Does **not** reopen Sprint 1616 or invent an autonomous engineering milestone. Blocked on owner credential for Edge function redeploy.

---

## Objective

Redeploy `ai-orchestrator` Edge to clear live BOOT_ERROR/503, then re-run confirm-gated AGKB e2e for JWT hard promote on the mandatory A→GK→B path.

## Business value

Restores Edge-backed promote/recommend hard path so roadmap production-ready can move from NO (owner Edge gate) to YES once classic owner blockers remain.

## Scope

**In scope**

- Owner provides `SUPABASE_ACCESS_TOKEN` out-of-band
- Redeploy recovered `ai-orchestrator` sources (CCC PR #8)
- Re-run `npm run agkb:confirm-e2e` expecting Edge hard promote PASS
- Refresh Architecture Office STATUS / oversight state from evidence

**Out of scope**

- Reopening AO-WP-003/004 unless regression
- Queuing Sprint 1616
- LLM / Smartsheet / MFA / SIEM / ITP standards unlocks (separate owner list)

## Architecture

- Shared `ci_*` + Governed Knowledge only
- A→GK→B mandatory; forbid Memory-only A→B and direct A→B
- Production gate CLOSED unless genuine defect

## Database

- No new migrations required for redeploy; consume existing AGKB / CI schema

## API

- Edge: `ai-orchestrator` (confirm / promote path)
- Related tools remain `ci_itp_*` / AGKB confirm pathway

## UI

- No SPA redeploy required for this package (AO-WP-004 already live)

## Knowledge Graph integration

- Soft-link / provenance from AGKB e2e must remain GK-cited after Edge hard promote

## Digital Brain integration

- Brain lineage objects remain project-scoped; promote stays A→GK→B

## Security

- Do not commit `SUPABASE_ACCESS_TOKEN` or JWTs into evidence
- Fail closed if Edge redeploy leaves BOOT_ERROR

## Dependencies

- AO-WP-004 completed (SPA go-live)
- CCC Edge source recovery merged (PR #8)
- Owner `SUPABASE_ACCESS_TOKEN`

## Risks

| Risk | Mitigation |
|------|------------|
| Token leakage in logs/evidence | Scrub secrets; evidence records status codes only |
| Mistaken Sprint 1616 reopen | Package is owner-gated parallel stream only |
| Edge still 503 after redeploy | Abort; capture logs; do not claim hard promote PASS |

## Acceptance criteria

- [ ] Owner provides deploy token
- [ ] `ai-orchestrator` redeployed; live probe no longer BOOT_ERROR/503
- [ ] `npm run agkb:confirm-e2e` Edge hard promote PASS
- [ ] Oversight / Architecture Office state refreshed
- [x] Guard: Sprint 1616 remains NOT queued

## Validation

1. Live Edge health probe (no BOOT_ERROR)  
2. `npm run agkb:confirm-e2e` → Edge hard promote PASS  
3. `node scripts/architecture-office-guard.mjs` → PASS  

## Evidence required

- Updated `docs/uat-screenshots/AGKB_CONFIRM_E2E_SOAK_EVIDENCE.json` (Edge hard)
- `docs/uat-screenshots/ROADMAP_PRODUCTION_READY_EVIDENCE.json` refresh
- Optional Edge deploy stamp note (no secrets)

---

## Active-work conflict declaration

| Field | Value |
|-------|--------|
| Conflicts with autonomous engineering queue | **No** |
| Conflicts with parallel CIP/ITP streams | **No** |
| Production gate impact | **Owner-gated Edge fix**; does not reopen continuous sprint queue |
