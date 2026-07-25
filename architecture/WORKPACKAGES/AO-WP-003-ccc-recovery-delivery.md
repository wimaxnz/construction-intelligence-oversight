# AO-WP-003 — CCC recovery, production readiness, and ITP/CI delivery

**Status:** completed  
**Result:** FAIL (CCC access / live smoke blocked)  
**Completed:** 2026-07-25  
**Approved date:** 2026-07-25  
**Review:** [`../REVIEWS/AO-REV-003-CCC-DELIVERY.md`](../REVIEWS/AO-REV-003-CCC-DELIVERY.md)  
**Status artefact:** [`../STATUS/AO-WP-003-CCC-DELIVERY.md`](../STATUS/AO-WP-003-CCC-DELIVERY.md)  
**Governing reference:** [`../CCC_ARCHITECTURE.md`](../CCC_ARCHITECTURE.md)

---

## Objective

Use the newly published private repository `wimaxnz/construction-command-centre` to:

1. reproduce, diagnose, and fix the production blank-page defect;
2. close verifiable CCC production-readiness gaps;
3. advance the ITP Library → CI Engine stream without interrupting or overwriting active CIP/ITP work.

## Business value

Restore reliable production access, move CCC from claimed readiness to evidence-backed readiness, and continue the governed ITP intelligence foundation without parallel-agent damage.

## Scope

**In scope**

- Clone/read `wimaxnz/construction-command-centre`
- Inspect `main`, `feature/itp-ci-engine-integration`, and `feature/developer-demo-role-switch`
- Reproduce the blank page using build/runtime evidence
- Implement the smallest verified defect fix on a dedicated branch
- Verify public asset paths, base URL, routing, CSP, deployment output, and the documented `public/assets` ACL regression
- Run available build, tests, lint, typecheck, smoke checks, and repository guards
- Audit production-readiness claims against actual code and evidence
- Continue only non-conflicting ITP/CI work from committed remote state
- Open focused PRs; publish oversight evidence and review

**Out of scope**

- Force-push, reset, delete, rewrite history, or discard work
- Merging feature branches into `main` without review
- Touching the local 13.7k-entry uncommitted working tree
- Reopening Sprint 1616 or inventing unrelated roadmap scope
- Broad redesign, new infrastructure, n8n, or bridge services
- Production mutation unless the blank-page defect is proven and the change is minimal, reversible, and authorized by existing deployment controls

## Architecture

- Treat `main` as canonical.
- Create dedicated branches for blank-page and readiness changes.
- Never repurpose or overwrite `feature/itp-ci-engine-integration`.
- Parse once and consume shared `ci_*` structures.
- Cross-project learning remains Project A → Governed Knowledge → Project B.
- Production gate remains closed except for a genuine reproduced defect.

## Database

- No schema change for blank-page recovery unless evidence proves one is essential.
- For ITP/CI, use existing governed migrations and shared `ci_*` tables.
- Do not apply remote migrations without explicit evidence, rollback notes, and existing authorization.

## API

- Verify deployed API/Edge endpoints used during application bootstrap.
- Confirm failures degrade visibly and do not produce an unexplained blank screen.
- Do not expose server-side AI/IP logic or credentials.

## UI

- Reproduce the blank page at the production entry route and direct nested routes.
- Capture console, network, asset, routing, and runtime-bootstrap evidence.
- Add or verify an error boundary/fail-visible state where appropriate.
- Confirm desktop and mobile entry routes render after the fix.

## Knowledge Graph integration

- ITP Library entities must map to shared governed entities and relationships.
- No siloed ITP graph or direct Project A → Project B transfer.
- Record provenance, version, project scope, and approval state.

## Digital Brain integration

- Emit project-scoped ITP/inspection events through existing contracts.
- Do not treat Memory as the governed cross-project transfer layer.
- Verify that recommendations cite governed source artefacts.

## Security

- Never print, commit, or request secrets in logs or PRs.
- Preserve RLS, CSP, HSTS, AI-IP gateway, and crawler protections.
- Treat the known `public/assets` ACL issue and `ccc-fix-public-acls` post-deploy step as a primary hypothesis, not an assumed answer.
- Use least privilege and reversible changes.

## Dependencies

- Private CCC repository: `wimaxnz/construction-command-centre`
- Canonical branch: `main`
- Existing remote feature branches must remain intact
- Oversight repository `main` remains the Architecture Office source of truth

## Risks

| Risk | Mitigation |
|------|------------|
| Cloud agent conflicts with active local ITP work | Never write to or force-update the existing ITP branch; use focused new branches and PRs |
| Blank-page cause guessed rather than reproduced | Require console/network/build evidence before fix |
| Readiness becomes a documentation claim | Require executable checks and linked evidence |
| Production regression | Minimal fix, rollback note, gated deployment |
| Scope explosion | Priority order, focused PRs, stop only on genuine credential/destructive blocker |
| CCC remote inaccessible to automation | Fail closed; oversight STATUS/REVIEW only; owner grants access then re-approves |

## Acceptance criteria

- [x] Oversight STATUS, REVIEW, archived work package, and machine state updated
- [x] Architecture Office guard passes
- [x] Queue returns to `AO-WP-NONE` unless another package is explicitly approved
- [x] No secrets exposed and no existing work lost
- [x] ITP Library → CI Engine remote feature branch not modified
- [ ] Blank-page defect reproduced or disproved with concrete SPA evidence (**blocked**: CCC + Cloudflare)
- [ ] Root cause recorded (**blocked**)
- [ ] Smallest safe fix implemented on a dedicated branch (**blocked**)
- [ ] Build and relevant tests pass (**blocked**)
- [ ] Production entry and nested-route smoke evidence recorded (**blocked** beyond CF challenge)
- [ ] Production-readiness checklist reconciled with actual repository state (**partial**: oversight matrix only)
- [ ] Every remaining readiness gap has owner, evidence, and exact next action (**done** in STATUS)
- [ ] Focused PR or PRs opened against the correct CCC base (**blocked**: no CCC access)

## Validation

1. `node scripts/architecture-office-guard.mjs` → PASS  
2. CCC clone attempts recorded as inaccessible  
3. Production probe recorded as Cloudflare 403 challenge  
4. Review FAIL recorded under `REVIEWS/AO-REV-003-CCC-DELIVERY.md`

## Evidence required

- `STATUS/AO-WP-003-CCC-DELIVERY.md`
- `REVIEWS/AO-REV-003-CCC-DELIVERY.md`
- Guard PASS
- Owner-only CCC remote setup notes

## Active-work conflict declaration

| Field | Value |
|-------|-------|
| Conflicts with autonomous engineering queue | **No** |
| Conflicts with active CIP/ITP work | **No** (no CCC writes) |
| Production gate impact | **None** (gate remains CLOSED) |
