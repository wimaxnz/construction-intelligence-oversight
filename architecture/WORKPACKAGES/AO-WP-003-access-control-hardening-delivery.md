# AO-WP-003 — Access Control hardening live delivery

**Status:** completed  
**Completed:** 2026-07-27  
**Approved date:** 2026-07-26  
**Review:** [`../REVIEWS/AO-REV-003-access-control-hardening-delivery.md`](../REVIEWS/AO-REV-003-access-control-hardening-delivery.md)  
**Governing reference:** [`../CCC_ARCHITECTURE.md`](../CCC_ARCHITECTURE.md)  
**CCC merge tip:** `1cc0069` (PRs #1, #2, #3)  
**Live stamp (delivery):** `20260726T010500Z-acl-hardening-sb`

---

## Objective

Close the Access Control hardening work package after live production delivery, persona UAT, and post-merge re-verification — without reopening unless a post-merge regression proves a genuine ACL defect.

## Business value

Persona-scoped navigation and RLS isolation protect commercial/portfolio surfaces and keep demo View-as fail-closed, establishing a durable production readiness gate for role-based access.

## Scope

**In scope (delivered in CCC; closed here as Architecture Office package)**

- Persona capability matrix + soft-role caps (migrations 036/037)
- Scoped developer demo View-as
- Live persona UAT (13/13) + isolation probes
- Post-merge re-verification evidence on `main`
- Architecture Office completion + archive pointers

**Out of scope**

- Reopening access-control for polish
- Interrupting CIP continuous ITP floors
- Reopening Sprint 1616 / inventing autonomous milestones

## Architecture

- Server-side RLS + capability checks remain authoritative
- Demo View-as is operator-scoped and time-bounded
- Production gate remains CLOSED unless genuine defect
- A→GK→B / parse-once / Sprint 521 doctrines unchanged

## Database

- CCC migrations `036_access_control_hardening.sql`, `037_access_control_soft_role_caps.sql` (applied in delivery stream)

## API

- No new public AI IP surfaces; capability gating on existing modules

## UI

- Persona-filtered navigation; commercial/admin isolation; demo banner + exit

## Knowledge Graph integration

- No Memory-only A→B; no silo graphs introduced by ACL work

## Digital Brain integration

- Project-scoped; ACL does not invent cross-project brain leakage

## Security

- Fail-closed denial of commercial/portfolio for non-capable personas
- Post-deploy ACL gate `ccc-fix-public-acls` (assets 200 / mask rwx) mandatory for SPA deploys
- No credentials in evidence artefacts

## Dependencies

- AO-WP-002 complete
- CCC PRs #1–#3 merged to `main` at/after `1cc0069`

## Risks

| Risk | Mitigation |
|------|------------|
| CIP SPA thrashing overwrites docroot stamp | Treat ACL package closed on merge+UAT evidence; verify ACL behaviour in post-merge regression, not stamp string alone |
| Accidental reopen for polish | Review: no reopen unless regression FAIL |

## Acceptance criteria

- [x] CCC access-control PRs merged (`#1`, `#2`, `#3`)
- [x] Live persona UAT overall PASS (13/13)
- [x] Isolation / selftest evidence recorded
- [x] Architecture Office completion + review PASS
- [x] Next work package advanced away from access-control

## Validation

1. `node scripts/architecture-office-guard.mjs` → PASS  
2. CCC `npm run access-control:selftest` + `demo-access:selftest` on `main` (post-merge regression)  
3. Host HTTP 200 + hashed assets 200

## Evidence required

- CCC `docs/uat-screenshots/ACCESS_CONTROL_LIVE_DELIVERY_EVIDENCE.json`
- Archive: `docs/uat-screenshots/archive/access-control-20260726/`
- Post-merge: `docs/uat-screenshots/POST_MERGE_REGRESSION_EVIDENCE.json`

---

## Active-work conflict declaration

| Field | Value |
|-------|--------|
| Conflicts with autonomous engineering queue | **No** |
| Conflicts with parallel CIP/ITP streams | **No** (oversight close-out only) |
| Production gate impact | **None** (delivery already live; gate stays CLOSED unless defect) |
