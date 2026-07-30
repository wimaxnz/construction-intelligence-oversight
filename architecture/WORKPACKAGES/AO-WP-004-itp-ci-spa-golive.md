# AO-WP-004 — ITP CI Engine SPA quiet-window go-live

**Status:** completed  
**Completed:** 2026-07-30  
**Review:** [`../REVIEWS/AO-REV-004-itp-ci-spa-golive.md`](../REVIEWS/AO-REV-004-itp-ci-spa-golive.md)  
**Governing reference:** [`../CCC_ARCHITECTURE.md`](../CCC_ARCHITECTURE.md)  
**CCC merge tip:** `7ed70612` (PR #7)  
**Go-live stamp:** `20260730T032754Z-itp-ci-engine`

---

## Objective

Ship the ITP Library → CI Engine SPA to production during a CIP quiet window with ACL post-deploy gates and durable go-live evidence.

## Business value

Published shared ITP CI Engine consumption on live Defects / Programme / QA surfaces without thrashing CIP floors or reopening access-control.

## Scope delivered

- CIP quiet-window go-live (`CIP_SPA_QUIET=1`)
- ACL-safe SPA deploy (`ccc-fix-public-acls`)
- Host HTTP 200 + assets ACL `rwx`
- Go-live + Command Centre production validation evidence
- AGKB confirm-gated A→GK→B e2e (DB path PASS; Edge soft 503)

## Architecture

- Shared `ci_*` + GK only; parse-once preserved
- A→GK→B learning path intact
- Production gate CLOSED unless genuine defect

## Evidence (CCC)

- `docs/uat-screenshots/AO_WP_004_GOLIVE_EVIDENCE.json`
- `docs/uat-screenshots/CIP_ITP_CI_SPA_STAGE_EVIDENCE.json`
- `docs/uat-screenshots/COMMAND_CENTRE_PRODUCTION_VALIDATION_STATUS.json`
- `docs/uat-screenshots/AGKB_CONFIRM_E2E_SOAK_EVIDENCE.json`

## Acceptance

| Criterion | Result |
|-----------|--------|
| SPA staged then go-live under quiet window | PASS |
| Host HTTP 200 + assets rwx | PASS |
| Production main script `CR0h3ngY.js` | PASS |
| ITP CI Engine selftest 52/52 | PASS |
| ACL package not reopened | PASS |
| AGKB e2e DB confirm path | PASS |

## Out of scope / follow-on

- Edge `ai-orchestrator` JWT hard promote → **AO-WP-005** (owner-gated)
- Sprint 1616 / new autonomous milestone → **not queued**
