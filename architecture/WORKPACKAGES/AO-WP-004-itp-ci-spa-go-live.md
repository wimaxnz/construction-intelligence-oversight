# AO-WP-004 — ITP CI Engine SPA quiet-window go-live + production readiness soak

**Status:** completed  
**Result:** FAIL (CCC access / quiet-window go-live blocked)  
**Completed:** 2026-07-27  
**Approved date:** 2026-07-27  
**Review:** [`../REVIEWS/AO-REV-004-itp-ci-spa-go-live.md`](../REVIEWS/AO-REV-004-itp-ci-spa-go-live.md)  
**Status artefact:** [`../STATUS/AO-WP-004-ITP-CI-SPA-GO-LIVE.md`](../STATUS/AO-WP-004-ITP-CI-SPA-GO-LIVE.md)  
**Governing reference:** [`../CCC_ARCHITECTURE.md`](../CCC_ARCHITECTURE.md)  
**Canonical oversight:** [`../../AI_OVERSIGHT_STATE.json`](../../AI_OVERSIGHT_STATE.json)  
**CCC branch (untouched):** `feature/itp-ci-engine-integration`  
**Prior package:** AO-WP-003 Access Control hardening — COMPLETED (not reopened)

> Production-readiness parallel stream. Does **not** reopen Sprint 1616 or invent an autonomous engineering milestone. Must not thrash CIP ITP floors — go-live only when `CIP_SPA_QUIET=1` (or equivalent quiet window).

---

## Objective

Ship the ITP Library → CI Engine SPA to production during a CIP quiet window, with ACL post-deploy gate (`ccc-fix-public-acls`), host HTTP 200 / assets rwx, and durable go-live evidence — then deepen live JWT soak where tokens exist.

## Business value

Moves shared ITP CI Engine consumption from staged/branch readiness into live production surfaces (Defects, Programme, QA) without fighting CIP SPA deploys or reopening access-control.

## Scope

**In scope (attempted)**

- Quiet-window detection / coordination (read-only CIP state)
- `npm run itp-ci-engine:spa-stage` with `--go-live` only when quiet
- Post-deploy ACL + HTTP gates
- Update `CIP_ITP_CI_SPA_STAGE_EVIDENCE.json` / go-live evidence
- Live soak of CI ITP tools when JWT available
- Architecture Office STATUS refresh on milestone

**Out of scope**

- Reopening access-control (unless ACL regression)
- Pausing CIP floors for polish
- Queuing Sprint 1616
- Owner credential unlocks (LLM/Smartsheet) as blockers for this SPA gate
- Force-push / destructive git on CCC or oversight

## Architecture

- Shared `ci_*` + Governed Knowledge only; no silo ITP tables
- Parse-once: engine must not re-read PDFs
- A→GK→B for learning ingest / promote; forbid Memory-only A→B
- Production gate CLOSED unless genuine defect; this package is parallel production readiness
- Never overwrite active CIP floor packs mid-flight

## Database

- Consume existing mig 035 / shared CI schema; no new silo migrations for go-live

## API

- Existing Edge tools: `ci_itp_recommend`, `ci_itp_generate_requirements`, `ci_itp_learning_ingest`

## UI

- Defects / Programme / QA dashboards already wired on feature branch — SPA go-live publishes them

## Knowledge Graph integration

- Recommendations and close-out learning must cite shared entities / GK provenance

## Digital Brain integration

- Project-scoped brain events only; learning promote stays on A→GK→B toolpath

## Security

- Mandatory `ccc-fix-public-acls` after SPA publish
- Fail closed if host HTTP ≠ 200 or assets ACL mask ≠ rwx
- Do not embed secrets in evidence

## Dependencies

- AO-WP-003 completed
- CCC `feature/itp-ci-engine-integration` integration selftests green
- CIP SPA quiet window for go-live
- **CCC clone access** (blocked this run)

## Risks

| Risk | Mitigation |
|------|------------|
| CIP thrashing overwrites SPA mid-deploy | Require `CIP_SPA_QUIET=1`; stage-only otherwise |
| ACL blank-page regression | Run `ccc-fix-public-acls`; abort if assets not 200/rwx |
| Mistaken reopen of access-control | Only reopen on ACL selftest/live FAIL |
| CCC remote inaccessible to automation | Fail closed; document owner-only remote; no invented remotes |

## Acceptance criteria

- [ ] SPA staged locally with ITP CI Engine stamp marker
- [ ] Go-live executed only under quiet window
- [ ] Host HTTP 200 + assets ACL rwx after deploy
- [ ] Go-live evidence JSON written
- [ ] ITP CI Engine selftest still PASS
- [ ] Access-control selftest still PASS (no reopen)
- [x] Oversight FAIL close-out when CCC access blocked (this run)

## Validation

1. `npm run itp-ci-engine:selftest` → blocked (no CCC checkout)  
2. `CIP_SPA_QUIET=1 npm run itp-ci-engine:spa-stage -- --go-live` → blocked  
3. Host probe HTTP 200; ACL assets 200/rwx → blocked (Cloudflare challenge)  
4. `npm run access-control:selftest` → blocked (no CCC checkout)  
5. `node scripts/architecture-office-guard.mjs` → PASS (oversight)

## Evidence required

- Oversight STATUS + FAIL review documenting owner-only CCC remote
- Production probe: Cloudflare `cf-mitigated: challenge` / HTTP 403 from this environment
- CCC go-live evidence deferred until owner grants clone access

---

## Active-work conflict declaration

| Field | Value |
|-------|--------|
| Conflicts with autonomous engineering queue | **No** |
| Conflicts with parallel CIP/ITP streams | **No** — CIP/ITP branches untouched |
| Production gate impact | **None** — gate stays CLOSED; no deploy attempted |
